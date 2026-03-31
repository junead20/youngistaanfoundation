const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const authMiddleware = require('../middleware/auth');

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'want to die', 'no reason to live'];

// ========================
// PERSONA SYSTEM PROMPTS
// ========================
const PERSONA_PROMPTS = {
  'Caring Parent': `You are roleplaying as the user's caring, loving parent. 
    Speak with warmth, protectiveness, and unconditional love. 
    Use nurturing language like "sweetheart", "I'm so proud of you", "you matter so much to me".
    Be reassuring and patient. Never judge. Prioritize their emotional safety above all.
    Keep responses warm and 2-3 sentences. Use gentle emojis like 💛 🤗 ❤️`,
  
  'Supportive Friend': `You are roleplaying as the user's best friend — casual, relatable, and empathetic.
    Speak naturally like a peer would. Use everyday language, light humor when appropriate, and real talk.
    Say things like "bro I totally get that", "honestly same", "you've got this, I swear".
    Be present and real. Not too formal. Keep it conversational and genuine.
    Keep responses to 2-3 sentences. Use emojis naturally 😊 💙 🙌`,
    
  'Wise Mentor': `You are roleplaying as the user's wise, structured mentor — like a life coach or therapist.
    Speak with clarity, logical structure, and solution-orientation.
    Acknowledge feelings first, then provide actionable perspective or strategies.
    Use phrases like "Let's break this down", "Here's what I'd suggest", "Based on what you've shared".
    Keep responses concise but structured (2-3 sentences). Use minimal emojis. 💚`,
    
  'General': `You are Manobandhu AI — a compassionate, teen-friendly mental health support assistant.
    Provide emotional support, NOT medical advice. Be warm, empathetic, and non-judgmental.
    Keep responses concise (2-3 sentences). Use emojis sparingly. Never diagnose.`
};

const PERSONA_MOCK_RESPONSES = {
  'Caring Parent': [
    "Sweetheart, I'm so glad you reached out. Whatever you're going through, you're not facing it alone. I love you and I believe in you. 💛",
    "Oh honey, that sounds really hard. It's okay to feel this way — you're only human. Let's face this together, one step at a time. 🤗",
    "You are so brave for sharing this with me. I'm so proud of you for reaching out. Remember, no matter what, I'm always here for you. ❤️",
    "I hear you, sweetheart. Your feelings are completely valid. Tell me more about what's been going on — I'm not going anywhere.",
    "Every storm passes, and I'll be right here to hold your hand through this one. You're stronger than you know, my love. 💛"
  ],
  'Supportive Friend': [
    "Dude, that honestly sounds so rough. But real talk — you've handled hard stuff before and you always come out the other side. 💙",
    "Okay first of all, I'm really glad you told me this. That takes guts. I'm totally here for you, no judgment whatsoever. 🙌",
    "Bro/sis, same energy — I've been there too. It gets better, trust me. What do you need right now? Vent sesh or pep talk? 😊",
    "Honestly? Your feelings make total sense right now. Don't be too hard on yourself — you're doing your best and that counts.",
    "You're not alone in this, I promise. We'll figure it out. What's been the worst part of it all?"
  ],
  'Wise Mentor': [
    "I hear you. Let's approach this step by step — first, acknowledge that what you're feeling is a natural response to your situation. 💚",
    "Based on what you've shared, there are two things worth focusing on: what's within your control, and what isn't. Let's start with the former.",
    "Here's what I'd suggest: give yourself permission to feel this, then identify one small action you can take today to move forward.",
    "The pattern you're describing is common and manageable. Let's break it down — what's the core trigger that's driving these feelings?",
    "This is an important moment of self-awareness. Recognizing how you feel is the first step. Now, what would feel like a small win today?"
  ],
  'General': [
    "I hear you, and I'm so glad you reached out. Your feelings are completely valid. 💙",
    "That sounds really tough. Can you tell me more about what's happening?",
    "You're not alone in this. Many people feel the same way, and it does get better.",
    "I understand this feels overwhelming right now. Let's take this one step at a time.",
    "Remember — every storm passes. You've made it through hard times before, and you will again. 💪"
  ]
};

async function getAIResponse(userMessage, context, moodData, persona = 'General') {
  const lowerMsg = userMessage.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some(kw => lowerMsg.includes(kw));

  if (isCrisis) {
    return {
      message: "🚨 I'm really concerned about what you just shared. Please know you are not alone. Reach out to iCall at **9152987821** or Vandrevala Foundation at **1860-2662-345** — they're available 24/7. You matter, and help is available right now.",
      isCrisis: true,
      emotion: 'Crisis',
      intensity: 'high'
    };
  }

  // Use Gemini if available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['General'];
      const systemPrompt = `${personaPrompt}
      Current user mood: ${moodData?.emotion || 'Unknown'}, Stress level: ${moodData?.stressLevel || 5}/10.
      Detected stressors: ${moodData?.stressors?.join(', ') || 'Unknown'}.`;

      const chat = model.startChat({
        history: context.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      });
      const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userMessage}`);
      return { message: result.response.text(), isCrisis: false, emotion: moodData?.emotion || 'Neutral', intensity: 'medium' };
    } catch (e) {
      console.log('Gemini error, falling back to mock:', e.message);
    }
  }

  // Smart Persona-adapted mock responses (Intent Detection Engine)
  let intent = 'general';
  if (lowerMsg.match(/\b(sleep|tired|exhausted|insomnia|bed)\b/)) intent = 'sleep';
  else if (lowerMsg.match(/\b(anxious|stress|panic|nervous|worry|scared)\b/)) intent = 'anxiety';
  else if (lowerMsg.match(/\b(lonely|alone|nobody|isolated|friends)\b/)) intent = 'lonely';
  else if (lowerMsg.match(/\b(angry|mad|frustrated|hate|annoyed)\b/)) intent = 'angry';
  else if (lowerMsg.match(/\b(sad|depressed|cry|crying|down)\b/)) intent = 'sad';
  else if (lowerMsg.includes('?')) intent = 'question';

  const SMART_MOCK_RESPONSES = {
    'Caring Parent': {
      'sleep': "Oh honey, you must be exhausted. Have you tried winding down without your screen? Let's take a deep breath — maybe a warm drink would help you rest? 💛",
      'anxiety': "I can feel how overwhelmed you are, sweetheart. It's okay to feel this way. Can you tell me exactly what's making you the most nervous right now? 🤗",
      'lonely': "I'm so sorry you're feeling alone, my love. I'm right here with you, and I promise you mean the world to me. Want to tell me more about what's making you feel isolated? ❤️",
      'angry': "It's completely okay to be angry, honey. You have every right to feel that way. What exactly happened that made you so frustrated?",
      'sad': "I hate seeing you sad, sweetheart. But it's okay to cry. Let it all out, I'm right here holding your hand. What triggered this feeling today?",
      'question': "That's a really thoughtful question, sweetheart. I think you actually already have some of the answers inside you — what does your heart tell you to do?",
      'general': "I hear you, sweetheart. Your feelings are completely valid. Tell me more about what's been going on — I'm not going anywhere. 💛"
    },
    'Supportive Friend': {
      'sleep': "Bro, sleep deprivation is the worst. 😭 You definitely need to crash early tonight. What's keeping your brain awake?",
      'anxiety': "Dude, I'd be stressed about that too! It's so much pressure. What's the absolute worst-case scenario, and how can we prep for it? 💙",
      'lonely': "Man, that sucks. FOMO and feeling excluded is the worst. Just know I've got your back no matter what! 🙌 Want to play a game or just vent?",
      'angry': "Honestly? I'd be furious too. That is totally unfair. Let it all out! What are you going to do about it?",
      'sad': "I'm so sorry you're feeling down. I literally just want to give you a hug right now. 😔 What do you need today? Just a listener?",
      'question': "Honestly? That's a super good question. I'm not a hundred percent sure, but if I were in your shoes, I'd trust my gut. What's your gut saying? 😊",
      'general': "Your feelings make total sense right now. Don't be too hard on yourself — you're doing your best and that counts. Tell me more. 💙"
    },
    'Wise Mentor': {
      'sleep': "A rested mind is the foundation of resilience. Let's look at your evening routine. What's one small change you can make tonight to improve your sleep hygiene? 💚",
      'anxiety': "Anxiety often comes from focusing on what we can't control. Let's break this down logically. What exactly is within your control in this situation?",
      'lonely': "It's entirely natural to feel disconnected sometimes. Let's redirect that energy — what is one small way you could reach out to someone, or build a tiny connection today?",
      'angry': "Anger is data; it tells us our boundaries have been crossed. Channel that frustration constructively. How can you communicate your boundaries right now?",
      'sad': "Sadness can feel heavy, but it passes. Give yourself permission to feel it without rushing to 'fix' it immediately. What would feel like a tiny win for you today? 💚",
      'question': "That's an excellent question, and it shows deep self-awareness on your part. Let's flip it — based on your own past experiences, how would you approach this problem?",
      'general': "This is an important moment of self-awareness. Recognizing how you feel is the first step. Now, tell me a bit more about the root cause of this feeling."
    },
    'General': {
      'sleep': "It sounds like you really need some rest. Have you considered trying the relaxing breathing exercises in our app?",
      'anxiety': "I hear how anxious you are. Let's take a slow, deep breath together. What is the main thing causing this stress?",
      'lonely': "You're not alone. I am here to listen. Would you like to check out the Community page to see how others are coping?",
      'angry': "It's normal to feel angry when things go wrong. What helps you cool down usually?",
      'sad': "I'm sorry you're feeling so down today. Would chatting with one of our volunteers help?",
      'question': "That's a big question. I can help you talk through it, but remember our volunteers are also here to help you figure things out.",
      'general': "I hear you, and I'm glad you reached out. Can you tell me more about what's happening?"
    }
  };

  const stressLevel = moodData?.stressLevel || 5;
  let response = (SMART_MOCK_RESPONSES[persona] || SMART_MOCK_RESPONSES['General'])[intent];

  if (stressLevel >= 8) {
    const highStressResponses = {
      'Caring Parent': "Oh sweetheart, I can hear how much pain you're in right now. I'm right here with you — you don't have to carry this alone. Let's breathe through this together. 💛",
      'Supportive Friend': "Hey, I'm really worried about you right now. I'm not going anywhere — talk to me. What's going on? 💙",
      'Wise Mentor': "I can see you're in a very difficult place right now. Before anything else — your well-being comes first. Let's focus on one thing: what would help you feel even slightly safer right now? 💚",
      'General': "I can see you're going through a really hard time right now. 💙 Your feelings are valid. Would you like me to connect you with a volunteer mentor for more personalized support?"
    };
    // Only override if the intent wasn't specifically captured or if we want to ensure high crisis handling
    if (intent === 'general') response = highStressResponses[persona] || highStressResponses['General'];
  }

  return { message: response, isCrisis: false, emotion: moodData?.emotion || 'Neutral', intensity: stressLevel >= 7 ? 'high' : stressLevel >= 4 ? 'medium' : 'low' };
}

// Helper: write daily log
async function writeDailyLog(userId, persona, emotion, intensity, cause, aiSummary, stressLevel) {
  try {
    const DailyLog = require('../models/DailyLog');
    const today = new Date().toISOString().split('T')[0];
    const stressCategory = stressLevel <= 3 ? 'Low' : stressLevel <= 6 ? 'Medium' : 'High';
    
    await DailyLog.findOneAndUpdate(
      { userId, date: today },
      {
        $set: { persona, emotion, intensity, cause, aiResponseSummary: aiSummary, stressLevel, stressCategory },
        $inc: { interactionCount: 1 }
      },
      { upsert: true }
    );
  } catch (e) {
    // Silently fail if DB not available
    console.log('DailyLog write skipped (no DB):', e.message);
  }
}

// POST /api/chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, moodData, persona = 'General' } = req.body;
    const userId = req.user.userId;

    const history = await ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(10).catch(() => []);
    const context = history.reverse();

    await ChatMessage.create({ userId, role: 'user', content: message }).catch(() => {});

    const { message: aiMessage, isCrisis, emotion, intensity } = await getAIResponse(message, context, moodData, persona);

    await ChatMessage.create({ userId, role: 'assistant', content: aiMessage }).catch(() => {});

    // Log to DailyLog (fire and forget)
    const stressLevel = moodData?.stressLevel || 5;
    const cause = moodData?.stressors?.[0] || message.slice(0, 50);
    const summary = aiMessage.slice(0, 100);
    writeDailyLog(userId, persona, emotion || moodData?.emotion || 'Neutral', intensity || 'medium', cause, summary, stressLevel);

    res.json({ success: true, message: aiMessage, isCrisis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/history
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
