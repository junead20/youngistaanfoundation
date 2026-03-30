import express from 'express';
import Activity from '../models/Activity.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find({ active: true });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
