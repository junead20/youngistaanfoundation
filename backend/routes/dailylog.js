const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const auth = require('../middleware/auth');

/**
 * @route GET /api/dailylog
 * @desc Get last 30 days of logs for current user (or all users for volunteer)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = {};
    if (role === 'volunteer' || role === 'admin') {
      // Volunteers see anonymized aggregate data  
      query = { createdAt: { $gte: thirtyDaysAgo } };
    } else {
      query = { userId, createdAt: { $gte: thirtyDaysAgo } };
    }

    const logs = await DailyLog.find(query).sort({ date: -1 }).limit(300);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/dailylog/:date
 * @desc Get logs for a specific date (volunteer monitoring)
 */
router.get('/:date', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { date } = req.params;

    let query = { date };
    if (role !== 'volunteer' && role !== 'admin') {
      query.userId = userId;
    }

    const logs = await DailyLog.find(query);
    
    // Aggregate for the date
    const summary = {
      date,
      totalInteractions: logs.reduce((s, l) => s + l.interactionCount, 0),
      avgStressLevel: logs.length ? Math.round(logs.reduce((s, l) => s + l.stressLevel, 0) / logs.length * 10) / 10 : 0,
      emotions: [...new Set(logs.map(l => l.emotion))],
      personas: [...new Set(logs.map(l => l.persona))],
      topCauses: logs.map(l => l.cause).filter(Boolean),
      userCount: logs.length,
      distressCount: logs.filter(l => l.stressLevel >= 7).length,
      logs: role === 'volunteer' || role === 'admin' ? logs.map(l => ({
        ...l.toObject(), userId: `USR-${l.userId.substr(-4)}` // anonymize
      })) : logs
    };

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/dailylog
 * @desc Log or update today's check-in (called internally by chat route)
 */
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const { persona, emotion, intensity, cause, aiResponseSummary, stressLevel } = req.body;

    const stressCategory = stressLevel <= 3 ? 'Low' : stressLevel <= 6 ? 'Medium' : 'High';
    
    await DailyLog.findOneAndUpdate(
      { userId, date: today },
      {
        $set: { persona, emotion, intensity, cause, aiResponseSummary, stressLevel, stressCategory },
        $inc: { interactionCount: 1 }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
