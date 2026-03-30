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

// POST /api/auth/volunteer/register
router.post('/volunteer/register', async (req, res) => {
  try {
    const { name, email, password, expertise, ageGroups, bio } = req.body;
    const existing = await Volunteer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const volunteer = await Volunteer.create({ name, email, password, expertise, ageGroups, bio });
    const token = jwt.sign({ volunteerId: volunteer._id, role: 'volunteer', name: volunteer.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, name: volunteer.name, volunteerId: volunteer._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/volunteer/login
router.post('/volunteer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await volunteer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ volunteerId: volunteer._id, role: 'volunteer', name: volunteer.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true, token,
      volunteer: { name: volunteer.name, email: volunteer.email, expertise: volunteer.expertise, isAvailable: volunteer.isAvailable, totalSessions: volunteer.totalSessions }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
