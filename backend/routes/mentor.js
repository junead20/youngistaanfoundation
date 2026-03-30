const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock data for mentors
const MOCK_MENTORS = [
  { _id: 'm1', name: 'Priya S.', expertise: ['Anxiety', 'Studies'], ageGroups: ['13-18', '18-25'], bio: '3 years supporting teens through academic pressure and anxiety.', rating: 4.9, isAvailable: true },
  { _id: 'm2', name: 'Rahul M.', expertise: ['Relationships', 'Family'], ageGroups: ['18-25'], bio: 'Certified counselor passionate about youth well-being.', rating: 4.8, isAvailable: true },
  { _id: 'm3', name: 'Ananya K.', expertise: ['General Support'], ageGroups: ['13-18'], bio: 'Teen mental health advocate with empathetic listening skills.', rating: 4.7, isAvailable: true },
  { _id: 'm4', name: 'Dev P.', expertise: ['Depression', 'Loneliness'], ageGroups: ['18-25', '25+'], bio: 'Trained in CBT techniques, specializing in depression & isolation.', rating: 4.9, isAvailable: false },
];

/**
 * @route GET /api/mentor
 * @desc Get available mentors
 */
router.get('/', async (req, res) => {
  try {
    // In production, fetch from DB. For MVP, return mock.
    res.json({ success: true, mentors: MOCK_MENTORS });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/mentor/request
 * @desc Request a session with a mentor
 */
router.post('/request', auth, async (req, res) => {
  try {
    const { mentorId, issue } = req.body;
    const userId = req.user.userId;

    // Logic to notify mentor via Socket.io or DB record would go here
    console.log(`Mentor Request: ${userId} requested ${mentorId} for issue: ${issue || 'General'}`);

    res.json({ success: true, message: 'Request sent to mentor. Please wait for them to accept.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/mentor/availability
 * @desc Update mentor availability (Volunteer role only)
 */
router.put('/availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    // Update logic for volunteer availability in DB
    res.json({ success: true, isAvailable });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
