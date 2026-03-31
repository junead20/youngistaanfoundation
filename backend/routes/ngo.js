const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');

// Middleware for NGO access
const ngoOnly = (req, res, next) => {
  const auth = require('../middleware/auth');
  auth(req, res, () => {
    if (req.user && req.user.role === 'ngo') {
      next();
    } else {
      res.status(403).json({ message: 'NGO access only' });
    }
  });
};

// Mock data for NGOS
const NGO_RESOURCES = {
  activeHelplines: [
    { name: 'Sumaitri', description: 'Emotional support and crisis intervention for those in distress', phone: '011-23389090', website: 'https://sumaitri.net', tags: ['Grief', 'Loneliness', 'Crisis'], isHelpline: true, available24x7: false },
    { name: 'AASRA', description: 'Crisis intervention center for people in emotional distress', phone: '9820466627', website: 'http://www.aasra.info', tags: ['Suicide Prevention', 'Crisis'], isHelpline: true, available24x7: true },
    { name: 'Vandrevala Foundation', description: 'Support for those in emotional distress', phone: '1860-2662-345', website: 'https://vandrevalafoundation.com', tags: ['Support', 'Counseling', 'Crisis'], isHelpline: true, available24x7: true },
    { name: 'iCall (TISS)', description: 'Psychosocial helpline for people in distress', phone: '9152987821', website: 'https://icallhelpline.org', tags: ['Psychological', 'Counseling'], isHelpline: true, available24x7: false },
    { name: 'Fortis Helpline', description: 'National helpline for mental health support', phone: '8376804102', website: 'https://fortishealthcare.com', tags: ['Anxiety', 'General'], isHelpline: true, available24x7: true },
  ],
  organizations: [
    { name: 'Sangath', description: 'Community-based mental health services', phone: '011-41196200', website: 'https://sangath.in', tags: ['Community', 'Clinical'], isHelpline: false, available24x7: false },
    { name: 'The Banyan', description: 'Support for people with mental health issues from marginalized backgrounds', phone: '044-24535300', website: 'https://thebanyan.org', tags: ['Marginalized', 'Clinical'], isHelpline: false, available24x7: false },
  ]
};

/**
 * @route GET /api/ngo
 * @desc Get list of NGOs and resources (Public/All Users)
 */
router.get('/', (req, res) => {
  try {
    const allNgos = [...NGO_RESOURCES.activeHelplines, ...NGO_RESOURCES.organizations];
    res.json({ success: true, ngos: allNgos });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/ngo/admin/stats
 * @desc Get platform-wide analytics for NGO dashboard
 */
router.get('/admin/stats', ngoOnly, async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments({ role: 'volunteer' });
    const totalUsers = await User.countDocuments();
    
    // Recent moods logic to compute high stress users
    const recentMoods = await MoodEntry.find().sort({ timestamp: -1 }).limit(200);
    
    let highStress = 0;
    const moodDistribution = [
      { name: 'Happy', value: 0 },
      { name: 'Neutral', value: 0 },
      { name: 'Sad', value: 0 },
      { name: 'Stressed', value: 0 }
    ];
    
    recentMoods.forEach(entry => {
      if (entry.stressLevel && entry.stressLevel >= 7) highStress++;
      const bucket = moodDistribution.find(m => m.name === entry.emotion);
      if (bucket) bucket.value++;
    });

    res.json({
      success: true,
      stats: {
        totalVolunteers,
        totalUsers,
        highStressAlerts: highStress,
        activeInteractions: Math.max(0, Math.floor(totalVolunteers * 1.5))
      },
      moodDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/ngo/admin/volunteers
 * @desc Get a structured list of all registered volunteers
 */
router.get('/admin/volunteers', ngoOnly, async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ role: { $ne: 'ngo' } }) // exclude admins
      .select('-password -__v')
      .sort({ createdAt: -1 });
    res.json({ success: true, volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
