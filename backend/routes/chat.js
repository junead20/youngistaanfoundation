const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const authMiddleware = require('../middleware/auth');

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'want to die', 'no reason to live'];

const MOCK_RESPONSES = [
  "I hear you, and I'm so glad you reached out. Your feelings are completely valid. 💙",
  "It takes real courage to talk about what you're going through. I'm here with you.",
  "You're not alone in this. Many people feel the same way, and it does get better.",
  "That sounds really tough. Can you tell me more about what's happening?",
  "I understand this feels overwhelming right now. Let's take this one step at a time.",
  "Your mental health matters. Thank you for sharing this with me. 🌟",
  "It's okay to not be okay. What's been weighing on you the most lately?",
  "I want to make sure you feel supported. Have you been able to talk to anyone close to you?",
  "Sometimes our minds need as much care as our bodies. You're doing the right thing by seeking help.",
  "Remember — every storm passes. You've made it through hard times before, and you will again. 💪"
];

async function getAIResponse(userMessage, context, moodData) {
  const lowerMsg = userMessage.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some(kw => lowerMsg.includes(kw));

  if (isCrisis) {
    return {
      message: "🚨 I'm really concerned about what you just shared. Please know you are not alone. Reach out to iCall at **9152987821** or Vandrevala Foundation at **1860-2662-345** — they're available 24/7. You matter, and help is available right now.",
      isCrisis: true
    };
  }

  // If Gemini API key is available, use it
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = `You are Manobandhu AI — a compassionate, teen-friendly mental health support assistant. 
      You provide emotional support, NOT medical advice. Be warm, empathetic, and non-judgmental.
      Current user mood: ${moodData?.emotion || 'Unknown'}, Stress level: ${moodData?.stressLevel || 'Unknown'}/10.
      Keep responses concise (2-3 sentences max). Use emojis sparingly. Never diagnose.`;

      const chat = model.startChat({
        history: context.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      });
      const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userMessage}`);
      return { message: result.response.text(), isCrisis: false };
    } catch (e) {
      console.log('Gemini error, falling back to mock:', e.message);
    }
  }

  // Mock response with mood-aware selection
  const stressLevel = moodData?.stressLevel || 5;
  const responseIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
  let response = MOCK_RESPONSES[responseIndex];

  if (stressLevel >= 7) {
    response = "I can see you're going through a really hard time right now. 💙 Your feelings are valid. Would you like me to connect you with a volunteer mentor who can provide more personalized support?";
  }

  return { message: response, isCrisis: false };
}

// POST /api/chat - Send message to AI
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, moodData } = req.body;
    const userId = req.user.userId;

    // Get recent chat history for context
    const history = await ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(10).catch(() => []);
    const context = history.reverse();

    // Save user message
    await ChatMessage.create({ userId, role: 'user', content: message }).catch(() => { });

    // Get AI response
    const { message: aiMessage, isCrisis } = await getAIResponse(message, context, moodData);

    // Save AI response
    await ChatMessage.create({ userId, role: 'assistant', content: aiMessage }).catch(() => { });

    res.json({ success: true, message: aiMessage, isCrisis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/history - Get chat history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(50);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
