import express from 'express';
import Community from '../models/Community.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const communities = await Community.find({ active: true }).sort('-member_count');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
