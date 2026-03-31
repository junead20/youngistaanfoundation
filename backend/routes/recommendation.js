const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MoodEntry = require('../models/MoodEntry');
// GET /api/recommendation - Generate AI-powered restorative tip
router.get('/', auth, async (req, res) => {
  try {
    // 1. Get user's latest mood
    const latestMood = await MoodEntry.findOne({ userId: req.user.userId }).sort({ timestamp: -1 });
    
    if (!latestMood) {
      return res.json({ 
        tip: "Welcome! Log your first mood to get personalized self-care tips. ✨" 
      });
    }

    // 2. Call Ollama for a tip (fallback to static if it fails)
    let aiTip = "";
    try {
      const response = await fetch(process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3.2',
          messages: [
            { 
              role: 'system', 
              content: 'You are an empathetic mental health assistant. Provide a single, short (max 20 words), supportive restorative tip based on the user mood. No medical advice.' 
            },
            { 
              role: 'user', 
              content: `My latest mood is ${latestMood.emotion} with a stress level of ${latestMood.stressLevel}/10. What should I do?` 
            }
          ],
          stream: false
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      const data = await response.json();
      aiTip = data.message.content.trim();
    } catch (err) {
      console.log('Ollama recommendation error, using fallback');
      const fallbacks = {
        'Happy': "Celebrate your mood! Share some joy with a friend today.",
        'Neutral': "A calm day is a perfect time to reflect or try a new hobby.",
        'Sad': "It's okay to feel sad. Be gentle with yourself and try some light stretching.",
        'Stressed': "Take 5 deep breaths. Your peace of mind is more important than your to-do list."
      };
      aiTip = fallbacks[latestMood.emotion] || "Take a moment for yourself today. ✨";
    }

    res.json({ tip: aiTip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
