import express from 'express';
import { generateMiloResponse } from '../utils/chatbot.js';
import Chat from '../models/Chat.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// @desc    Chat with "Milo" (Gemini Emotional LLM)
// @route   POST /api/chatbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { userId, ageGroup, moodScore, conversation } = req.body;
    
    // Generate Milo's response (Supports Progressive Trust - Guest or User)
    const miloReply = await generateMiloResponse(moodScore, conversation, ageGroup);
    
    res.json(miloReply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Save chat session (Only for authenticated users)
// @route   POST /api/chatbot/save
router.post('/save', protect, async (req, res) => {
  try {
    const { ageGroup, moodScore, conversation, actionTaken } = req.body;
    
    const needsChecking = moodScore <= 3;
    
    const chatSession = new Chat({
      user_id: req.user._id,
      user_name: req.user.name,
      age_group: ageGroup || req.user.age_group,
      mood_score: moodScore,
      conversation: conversation,
      action_taken: actionTaken,
      needs_checking: needsChecking
    });
    
    await chatSession.save();

    // Alert volunteer if mood is critical
    if (needsChecking) {
      console.log(`\n[URGENT] Alert sent to volunteer for user ${req.user.name}\nReason: Critical mood score reported.\n`);
    }

    res.status(201).json({ success: true, id: chatSession._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get user's chat history
// @route   GET /api/chatbot/history
router.get('/history', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user_id: req.user._id }).sort('-timestamp');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
