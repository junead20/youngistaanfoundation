import express from 'express';
import jwt from 'jsonwebtoken';
import { generateMoodQuestions, analyzeMood } from '../utils/chatbot.js';
import User from '../models/User.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// DEBUG MIDDLEWARE
router.use((req, res, next) => {
  console.log(`[MOOD_ROUTER] ${req.method} ${req.url}`);
  next();
});

// @desc    Generate random mood questions
// @route   GET /api/mood/questions
router.get('/questions', async (req, res) => {
  console.log("Entering /questions endpoint");
  try {
    const questions = await generateMoodQuestions();
    res.json(questions);
  } catch (error) {
    console.error("Endpoint Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Analyze mood results and store (in cookies or DB)
// @route   POST /api/mood/analyze
router.post('/analyze', async (req, res) => {
  console.log("Entering /analyze endpoint");
  try {
    const { answers, fromGuest } = req.body;
    let userId = req.body.userId;

    // Optionally extract user from JWT if provided in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'yuva_pulse_default_secret_2026';
        const decoded = jwt.verify(token, secret);
        userId = decoded.id;
      } catch (err) {
        console.error("Optional JWT verify failed:", err.message);
      }
    }

    const analysis = await analyzeMood(answers);
    
    // If logged in, save to DB
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.mood_history.push({
          score: analysis.score,
          description: analysis.description
        });
        await user.save();
      }
    }

    // Always return result - Frontend stores it in cookies if fromGuest
    res.json(analysis);
  } catch (error) {
    console.error("Endpoint Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get mood history for logged in user
// @route   GET /api/mood/history
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('mood_history');
    res.json(user.mood_history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
