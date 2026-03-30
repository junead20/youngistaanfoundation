import express from "express";
import Volunteer from "../models/Volunteer.js";

const router = express.Router();

// Add volunteer observation
router.post("/", async (req, res) => {
  try {
    const obs = new Volunteer(req.body);
    await obs.save();
    res.json(obs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all observations with filters
router.get("/", async (req, res) => {
  try {
    const { age_group, program, city, severity, session_type, follow_up } = req.query;
    const filter = {};
    if (age_group) filter.age_group = age_group;
    if (program) filter.program = program;
    if (city) filter.city = city;
    if (severity) filter.severity = severity;
    if (session_type) filter.session_type = session_type;
    if (follow_up === "true") filter.follow_up_needed = true;

    const observations = await Volunteer.find(filter).sort({ timestamp: -1 });
    res.json(observations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get volunteer stats
router.get("/stats", async (req, res) => {
  try {
    const observations = await Volunteer.find();
    
    const obsTypeDistribution = {};
    const severityDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    const programObs = {};
    
    observations.forEach(o => {
      // Observation types
      obsTypeDistribution[o.observation_type] = (obsTypeDistribution[o.observation_type] || 0) + 1;
      
      // Severity
      severityDistribution[o.severity]++;
      
      // Program
      if (!programObs[o.program]) programObs[o.program] = { count: 0, highSeverity: 0 };
      programObs[o.program].count++;
      if (o.severity === "high" || o.severity === "critical") {
        programObs[o.program].highSeverity++;
      }
    });

    res.json({
      total: observations.length,
      obsTypeDistribution,
      severityDistribution,
      programObs,
      followUpNeeded: observations.filter(o => o.follow_up_needed).length,
      recentCritical: observations.filter(o => o.severity === "critical" || o.severity === "high").slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload offline sheet scores
router.post("/offline-upload", async (req, res) => {
  try {
    const { entries } = req.body; // Array of offline entries
    const results = [];
    
    for (const entry of entries) {
      const obs = new Volunteer({
        ...entry,
        session_type: "offline",
        severity: calculateOfflineSeverity(entry.offline_scores)
      });
      await obs.save();
      results.push(obs);
    }
    
    res.json({ uploaded: results.length, entries: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateOfflineSeverity(scores) {
  if (!scores) return "low";
  const avg = (scores.emotional_wellbeing + scores.social_interaction + scores.academic_engagement + scores.self_confidence + scores.overall) / 5;
  if (avg <= 2) return "critical";
  if (avg <= 4) return "high";
  if (avg <= 6) return "medium";
  return "low";
}

export default router;
