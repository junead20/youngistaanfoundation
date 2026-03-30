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
    res.status(201).json({ message: 'Mood logged', entry: newEntry });
  } catch (error) {
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
