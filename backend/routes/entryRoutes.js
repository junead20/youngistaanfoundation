import express from "express";
import Entry from "../models/Entry.js";
import { calculateRisk, getRiskLevel, getInsights } from "../utils/risk.js";
import { detectEarlyWarning } from "../utils/chatbot.js";

const router = express.Router();

// Add entry
router.post("/", async (req, res) => {
  try {
    const entry = new Entry(req.body);
    await entry.save();
    
    const score = calculateRisk(entry);
    res.json({
      ...entry._doc,
      risk_score: score,
      risk_level: getRiskLevel(score)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries with risk (supports filters)
router.get("/", async (req, res) => {
  try {
    const { age_group, program, city, risk_level, session_type } = req.query;
    const filter = {};
    if (age_group) filter.age_group = age_group;
    if (program) filter.program = program;
    if (city) filter.city = city;
    if (session_type) filter.session_type = session_type;

    const entries = await Entry.find(filter).sort({ timestamp: -1 });

    const enriched = entries.map(e => {
      const score = calculateRisk(e);
      return {
        ...e._doc,
        risk_score: score,
        risk_level: getRiskLevel(score)
      };
    });

    // Optionally filter by risk level
    const result = risk_level 
      ? enriched.filter(e => e.risk_level === risk_level)
      : enriched;

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const { age_group, program, city } = req.query;
    const filter = {};
    if (age_group) filter.age_group = age_group;
    if (program) filter.program = program;
    if (city) filter.city = city;

    const entries = await Entry.find(filter);
    
    if (!entries.length) {
      return res.json({
        total: 0,
        avgMood: 0,
        riskDistribution: {},
        programStats: {},
        cityStats: {},
        ageGroupStats: {},
        insights: [],
        helpCount: 0,
        peerSupportCount: 0
      });
    }

    const enriched = entries.map(e => ({
      ...e._doc,
      risk_score: calculateRisk(e),
      risk_level: getRiskLevel(calculateRisk(e))
    }));

    const avgMood = entries.reduce((s, e) => s + e.mood_score, 0) / entries.length;
    
    // Risk distribution
    const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    enriched.forEach(e => { riskDistribution[e.risk_level]++; });

    // Program stats
    const programStats = {};
    entries.forEach(e => {
      if (!programStats[e.program]) {
        programStats[e.program] = { count: 0, totalMood: 0, totalEngagement: 0, lowConf: 0 };
      }
      programStats[e.program].count++;
      programStats[e.program].totalMood += e.mood_score;
      programStats[e.program].totalEngagement += e.engagement_score || 5;
      if (["very_low", "low"].includes(e.confidence_level)) {
        programStats[e.program].lowConf++;
      }
    });

    Object.keys(programStats).forEach(p => {
      const ps = programStats[p];
      ps.avgMood = (ps.totalMood / ps.count).toFixed(2);
      ps.avgEngagement = (ps.totalEngagement / ps.count).toFixed(2);
      ps.lowConfPct = Math.round((ps.lowConf / ps.count) * 100);
    });

    // City stats
    const cityStats = {};
    entries.forEach(e => {
      if (!cityStats[e.city]) {
        cityStats[e.city] = { count: 0, totalMood: 0, highRisk: 0 };
      }
      cityStats[e.city].count++;
      cityStats[e.city].totalMood += e.mood_score;
    });
    enriched.forEach(e => {
      if (e.risk_level === "HIGH" || e.risk_level === "CRITICAL") {
        if (cityStats[e.city]) cityStats[e.city].highRisk++;
      }
    });
    Object.keys(cityStats).forEach(c => {
      cityStats[c].avgMood = (cityStats[c].totalMood / cityStats[c].count).toFixed(2);
    });

    // Age group stats
    const ageGroupStats = {};
    entries.forEach(e => {
      if (!ageGroupStats[e.age_group]) {
        ageGroupStats[e.age_group] = { count: 0, totalMood: 0, totalEngagement: 0 };
      }
      ageGroupStats[e.age_group].count++;
      ageGroupStats[e.age_group].totalMood += e.mood_score;
      ageGroupStats[e.age_group].totalEngagement += e.engagement_score || 5;
    });
    Object.keys(ageGroupStats).forEach(ag => {
      const a = ageGroupStats[ag];
      a.avgMood = (a.totalMood / a.count).toFixed(2);
      a.avgEngagement = (a.totalEngagement / a.count).toFixed(2);
    });

    // Mood over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter(e => e.timestamp >= thirtyDaysAgo);
    const moodOverTime = {};
    recentEntries.forEach(e => {
      const day = e.timestamp.toISOString().split("T")[0];
      if (!moodOverTime[day]) moodOverTime[day] = { total: 0, count: 0 };
      moodOverTime[day].total += e.mood_score;
      moodOverTime[day].count++;
    });

    const moodTrend = Object.entries(moodOverTime)
      .map(([date, d]) => ({ date, avgMood: (d.total / d.count).toFixed(2) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      total: entries.length,
      avgMood: avgMood.toFixed(2),
      riskDistribution,
      programStats,
      cityStats,
      ageGroupStats,
      moodTrend,
      insights: getInsights(entries),
      helpCount: entries.filter(e => e.help_flag).length,
      peerSupportCount: entries.filter(e => e.peer_support_used).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Early warning detection for a user
router.get("/early-warning/:userId", async (req, res) => {
  try {
    const entries = await Entry.find({ user_id: req.params.userId }).sort({ timestamp: -1 }).limit(10);
    const warnings = detectEarlyWarning(entries);
    res.json({ userId: req.params.userId, warnings: warnings || [], entriesAnalyzed: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;