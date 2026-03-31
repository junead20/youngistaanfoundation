const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined') {
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        // Ignored, proceed as anonymous
      }
    }
  }
  next();
};

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

  try {
    const SYSTEM_PROMPT = `
You are a casual chat companion for teenagers.

Rules:
- Max 2 sentences
- No motivational lines
- No therapy tone
- Talk like a normal friend
- Ask simple questions

Never say:
"You are not alone"
"Many people feel this way"
"It takes courage"

Be short, natural, and real.

Current user mood: ${moodData?.emotion || 'Unknown'}, Stress level: ${moodData?.stressLevel || 'Unknown'}/10.`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...context.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    let reply = data.message?.content || "";

    // 🔥 Hard control (IMPORTANT)
    reply = reply.split(/[.!?]/).slice(0, 2).join(".") + ".";

    return { message: reply.trim(), isCrisis: false };
  } catch (err) {
    console.log('Ollama error, falling back to mock:', err.message);
  }

  // Mock response with mood-aware selection (Fallback)
  const stressLevel = moodData?.stressLevel || 5;
  const responseIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
  let fallbackReply = MOCK_RESPONSES[responseIndex];

  if (stressLevel >= 7) {
    fallbackReply = "I can see you're going through a really hard time right now. 💙 Your feelings are valid. Would you like me to connect you with a volunteer mentor who can provide more personalized support?";
  }

  return { message: fallbackReply, isCrisis: false };
}

// POST /api/chat - Send message to AI
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, moodData, history: clientHistory } = req.body;
    let context = [];

    if (req.user) {
      const userId = req.user.userId;
      // Get recent chat history for context
      const dbHistory = await ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(10).catch(() => []);
      context = dbHistory.reverse();

      // Save user message
      await ChatMessage.create({ userId, role: 'user', content: message }).catch(() => { });
    } else {
      // Anonymous user: Use client history for context
      context = clientHistory || [];
    }

    // Get AI response
    const { message: aiMessage, isCrisis } = await getAIResponse(message, context, moodData);

    if (req.user) {
      const userId = req.user.userId;
      // Save AI response
      await ChatMessage.create({ userId, role: 'assistant', content: aiMessage }).catch(() => { });
    }

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
