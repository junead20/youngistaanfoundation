const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');

// POST /api/volunteer/register - Volunteer Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, expertise, ageGroups, bio } = req.body;

    // 1. Check for existing volunteer
    const existing = await Volunteer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Create volunteer
    const volunteer = await Volunteer.create({
      name,
      email,
      password,
      expertise: expertise || ['General Support'],
      ageGroups: ageGroups || ['13-18', '18-25'],
      bio: bio || '',
      role: 'volunteer'
    });

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        volunteerId: volunteer._id, 
        role: volunteer.role, 
        name: volunteer.name 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 4. Return success
    res.status(201).json({
      success: true,
      token,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/volunteer/login - Volunteer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate presence
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // 2. Find volunteer
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Compare password
    const isMatch = await volunteer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Generate JWT (volunteerId + role)
    const token = jwt.sign(
      { 
        volunteerId: volunteer._id, 
        role: volunteer.role || 'volunteer',
        name: volunteer.name 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. Return success
    res.json({
      success: true,
      token,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/volunteer/google-mock - Mock Google Login
router.post('/google-mock', async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID required' });
    }

    let volunteer = await Volunteer.findOne({ email });

    if (!volunteer) {
      // Create mock volunteer
      volunteer = await Volunteer.create({
        name: name || 'Google Volunteer',
        email,
        googleId,
        avatar: avatar || '',
        expertise: ['General Support'],
        ageGroups: ['13-18', '18-25'],
        bio: 'Mock Google Auth Volunteer',
        role: 'volunteer'
      });
    } else if (!volunteer.googleId) {
       // Link googleId to existing account if missing
       volunteer.googleId = googleId;
       await volunteer.save();
    }

    const token = jwt.sign(
      { 
        volunteerId: volunteer._id, 
        role: volunteer.role || 'volunteer',
        name: volunteer.name 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        avatar: volunteer.avatar
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Volunteer Auth Middleware (Local to this router for role checking)
const volunteerOnly = (req, res, next) => {
  const auth = require('../middleware/auth');
  auth(req, res, () => {
    if (req.user && req.user.role === 'volunteer') {
      next();
    } else {
      res.status(403).json({ message: 'Volunteer access only' });
    }
  });
};

// GET /api/volunteer/mentees - Fetch all mentees with latest mood
router.get('/mentees', volunteerOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const MoodEntry = require('../models/MoodEntry');
    const mentees = await User.find().select('userId nickname createdAt');
    
    // Attach latest mood to each mentee
    const enrichedMentees = await Promise.all(mentees.map(async (m) => {
      const latestMood = await MoodEntry.findOne({ userId: m.userId }).sort({ timestamp: -1 });
      return {
        ...m.toObject(),
        latestMood: latestMood || { stressLevel: 5, emotion: 'Neutral' }
      };
    }));

    res.json(enrichedMentees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/volunteer/mentees/:userId/history - Fetch 14-day mood history
router.get('/mentees/:userId/history', volunteerOnly, async (req, res) => {
  try {
    const MoodEntry = require('../models/MoodEntry');
    const history = await MoodEntry.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(14);
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/volunteer/notifications - Fetch unread alerts
router.get('/notifications', volunteerOnly, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ 
      volunteerId: req.user.volunteerId,
      isRead: false 
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/volunteer/notifications/:id/read - Mark alert as read
router.put('/notifications/:id/read', volunteerOnly, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
