const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

// Generate unique MBX ID
function generateUserId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MBX';
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// POST /api/auth/anonymous - New anonymous user
router.post('/anonymous', async (req, res) => {
  try {
    const { age, nickname } = req.body;
    let userId;
    let isUnique = false;
    while (!isUnique) {
      userId = generateUserId();
      const existing = await User.findOne({ userId }).catch(() => null);
      if (!existing) isUnique = true;
    }
    const user = await User.create({ userId, age: age || null, nickname: nickname || 'Anonymous' }).catch(() => ({
      userId, age: age || null, nickname: nickname || 'Anonymous'
    }));
    const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, userId, token, nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login - Returning anonymous user
router.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    let user = await User.findOne({ userId }).catch(() => null);
    if (!user) {
      // Allow access even if DB is down - generate token anyway
      user = { userId, nickname: 'Anonymous' };
    }
    const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, userId, token, nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me - Fetch current user profile
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
