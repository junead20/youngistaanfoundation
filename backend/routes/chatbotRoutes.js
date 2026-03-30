import express from "express";
import { generateMiloResponse } from "../utils/chatbot.js";
import Chat from "../models/Chat.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { userId, userName, ageGroup, moodScore, conversation } = req.body;
    
    // Generate Milo's response based on the conversation so far
    const miloReply = generateMiloResponse(moodScore, conversation, ageGroup);
    
    res.json(miloReply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { userId, userName, ageGroup, moodScore, conversation, actionTaken } = req.body;
    
    const needsChecking = moodScore <= 3;
    
    const chatSession = new Chat({
      user_id: userId,
      user_name: userName,
      age_group: ageGroup,
      mood_score: moodScore,
      conversation: conversation,
      action_taken: actionTaken,
      needs_checking: needsChecking
    });
    
    await chatSession.save();

    // Simulate sending an email to a volunteer if mood is very low
    if (needsChecking) {
      console.log(`\n[URGENT] Email sent to trained volunteer.\nSubject: Check-in needed for user ${userId}\nReason: User reported mood score of ${moodScore}/10.\nAction Required: Connect within 48 hours.\n`);
    }

    res.status(201).json({ success: true, id: chatSession._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin route to get chats
router.get("/history", async (req, res) => {
  try {
    const chats = await Chat.find().sort('-timestamp');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
