const express = require('express');
const router = express.Router();

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
 * @desc Get list of NGOs and resources
 */
router.get('/', (req, res) => {
  try {
    const allNgos = [...NGO_RESOURCES.activeHelplines, ...NGO_RESOURCES.organizations];
    res.json({ success: true, ngos: allNgos });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
