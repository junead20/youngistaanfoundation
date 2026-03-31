import express from "express";
import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

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

// Get live users with recent mood history for Volunteer Dashboard
router.get("/live-users", async (req, res) => {
  try {
    const users = await User.find({ "mood_history.0": { $exists: true } })
                            .select("name email role age_group mood_history")
                            .lean();

    // Map users to extract their latest mood
    const activeEntries = users.map(u => {
      const latestMood = u.mood_history[u.mood_history.length - 1];
      const timeDiffMs = Date.now() - new Date(latestMood.timestamp).getTime();
      const minsAgo = Math.floor(timeDiffMs / 60000);
      let timeStr = minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ago`;

      let riskLevel = 'Low';
      let colorClass = 'low';
      if (latestMood.score <= 3) {
        riskLevel = 'Priority Connect';
        colorClass = 'critical';
      } else if (latestMood.score <= 5) {
        riskLevel = 'Moderate';
        colorClass = 'yellow';
      }

      // Convert score to simple trend emoji based on previous score if exists
      let moodEmoji = '➖';
      if (u.mood_history.length > 1) {
        const prevScore = u.mood_history[u.mood_history.length - 2].score;
        if (latestMood.score > prevScore) moodEmoji = '📈';
        else if (latestMood.score < prevScore) moodEmoji = '📉';
      }

      return {
        id: u._id,
        name: u.name,
        ageGroup: u.age_group,
        mood: moodEmoji,
        risk: riskLevel,
        time: timeStr,
        color: colorClass,
        latestScore: latestMood.score
      };
    });

    // Sort by most critical first, then timestamp
    activeEntries.sort((a, b) => {
      if (a.color === 'critical' && b.color !== 'critical') return -1;
      if (a.color !== 'critical' && b.color === 'critical') return 1;
      return a.latestScore - b.latestScore; // lower score first
    });

    res.json(activeEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific user chat history
router.get("/user-chat/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const chats = await Chat.find({ user_id: req.params.id }).sort("-timestamp").lean();
    
    // Compile a unified detailed stat view for the volunteer
    res.json({
      user,
      recentChats: chats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
