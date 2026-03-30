import express from 'express';
import OfflineSession from '../models/OfflineSession.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const session = new OfflineSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const sessions = await OfflineSession.find().sort('-timestamp');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
