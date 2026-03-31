const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const auth = require('../middleware/auth');

// Add mood entry
router.post('/', auth, async (req, res) => {
  try {
    const { emotion, stressors, stressLevel, note } = req.body;
    const newEntry = new MoodEntry({
      userId: req.user.userId,
      emotion,
      stressors,
      stressLevel,
      note
    });
    await newEntry.save();

    // 🏆 Update User Stats (Streak & Sessions)
    const User = require('../models/User');
    const userProfile = await User.findOne({ userId: req.user.userId });
    if (userProfile) {
      userProfile.totalSessions += 1;
      
      // Simple streak logic: check if last log was yesterday
      const lastEntry = await MoodEntry.findOne({ 
        userId: req.user.userId, 
        _id: { $ne: newEntry._id } 
      }).sort({ timestamp: -1 });

      if (!lastEntry) {
        userProfile.streakDays = 1;
      } else {
        const today = new Date().setHours(0,0,0,0);
        const lastDate = new Date(lastEntry.timestamp).setHours(0,0,0,0);
        const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
        
        if (diff === 1) {
          userProfile.streakDays += 1;
        } else if (diff > 1) {
          userProfile.streakDays = 1;
        }
      }
      await userProfile.save();
    }

    // ALERT LOGIC: Trigger notification if stress level is high (>= 7)
    if (stressLevel >= 7) {
      const Volunteer = require('../models/Volunteer');
      const Notification = require('../models/Notification');
      
      const volunteers = await Volunteer.find({ isAvailable: true }).limit(5); // Notify up to 5 available volunteers
      
      for (const vol of volunteers) {
        await Notification.create({
          volunteerId: vol._id,
          userId: req.user.userId,
          message: `🚨 ALERT: Student ${req.user.userId} just logged a HIGH stress mood (${stressLevel}/10). Please reach out.`,
          type: 'risk'
        });
        
        // Mock Email Alert
        console.log(`[EMAIL ALERT SENT to ${vol.email}]: New high-stress entry from ${req.user.userId}`);
      }
    }

    res.status(201).json({ message: 'Mood logged', entry: newEntry });
  } catch (error) {
    console.error('Mood Log Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user mood history
router.get('/', auth, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.userId }).sort({ timestamp: -1 });
    res.json({ entries });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
