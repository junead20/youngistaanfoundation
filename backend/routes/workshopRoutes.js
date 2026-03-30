import express from "express";
import Workshop from "../models/Workshop.js";

const router = express.Router();

// Add workshop
router.post("/", async (req, res) => {
  try {
    const workshop = new Workshop(req.body);
    await workshop.save();
    res.json(workshop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all workshops
router.get("/", async (req, res) => {
  try {
    const { program, city, age_group } = req.query;
    const filter = {};
    if (program) filter.program = program;
    if (city) filter.city = city;
    if (age_group) filter.age_group = age_group;

    const workshops = await Workshop.find(filter).sort({ date: -1 });
    res.json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get impact stats
router.get("/impact", async (req, res) => {
  try {
    const workshops = await Workshop.find();
    
    if (!workshops.length) {
      return res.json({
        total: 0,
        totalParticipants: 0,
        avgImprovement: {},
        programImpact: {}
      });
    }

    let totalConfImprovement = 0;
    let totalMoodImprovement = 0;
    let totalEngImprovement = 0;
    let totalParticipants = 0;

    const programImpact = {};

    workshops.forEach(w => {
      totalParticipants += w.participants_count || 0;
      
      const confDiff = (w.post_scores?.avg_confidence || 0) - (w.pre_scores?.avg_confidence || 0);
      const moodDiff = (w.post_scores?.avg_mood || 0) - (w.pre_scores?.avg_mood || 0);
      const engDiff = (w.post_scores?.avg_engagement || 0) - (w.pre_scores?.avg_engagement || 0);

      totalConfImprovement += confDiff;
      totalMoodImprovement += moodDiff;
      totalEngImprovement += engDiff;

      if (!programImpact[w.program]) {
        programImpact[w.program] = { 
          count: 0, participants: 0,
          confImprovement: 0, moodImprovement: 0, engImprovement: 0 
        };
      }
      programImpact[w.program].count++;
      programImpact[w.program].participants += w.participants_count || 0;
      programImpact[w.program].confImprovement += confDiff;
      programImpact[w.program].moodImprovement += moodDiff;
      programImpact[w.program].engImprovement += engDiff;
    });

    // Average per workshop
    Object.keys(programImpact).forEach(p => {
      const pi = programImpact[p];
      pi.avgConfImprovement = (pi.confImprovement / pi.count).toFixed(2);
      pi.avgMoodImprovement = (pi.moodImprovement / pi.count).toFixed(2);
      pi.avgEngImprovement = (pi.engImprovement / pi.count).toFixed(2);
    });

    res.json({
      total: workshops.length,
      totalParticipants,
      avgImprovement: {
        confidence: (totalConfImprovement / workshops.length).toFixed(2),
        mood: (totalMoodImprovement / workshops.length).toFixed(2),
        engagement: (totalEngImprovement / workshops.length).toFixed(2)
      },
      programImpact,
      workshops: workshops.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
