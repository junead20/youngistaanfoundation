import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// OFFLINE EMPATHY ENGINE REPOSITORY
const OFFLINE_QUESTIONS = [
  ["If your mood was a color today, which one would it be?", "On a scale of 1-10, how much energy do you have right now?", "What's one small thing that made you smile today?", "Pick an emoji that represents your vibe 👇"],
  ["What is one word that describes your morning?", "How heavy does your backpack of worries feel today?", "Did you drink enough water or eat something good?", "Show me your mood in one emoji 👇"],
  ["If today was a weather forecast, what would it be?", "Who is someone you wish you could talk to right now?", "What's your biggest distraction today?", "Drop an emoji that matches your energy 👇"],
  ["What song matches how you feel right now?", "Are you feeling more 'go go go' or 'slow down'?", "Name one thing you are looking forward to.", "What emoji speaks to your soul right now? 👇"],
  ["How are your stress levels holding up today?", "If you could pause time right now, what would you do?", "What's one thing you are proud of surviving this week?", "Give me an emoji that summarizes today 👇"]
];

/**
 * Generate 3-5 random mood questions using Gemini.
 */
export async function generateMoodQuestions() {
  const prompt = `
    You are a friendly, teen-centric mental health assistant for YuvaPulse. 
    Generate 4 unique, creative, and non-threatening mood questions that help a user express their feelings without using clinical jargon.
    Return the result as a simple JSON array of strings.
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\[.*\]/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("Using Local Empathy Engine for Mood Questions.");
    // Seed by day of the month so it changes daily but stays consistent for the day
    const dayIndex = new Date().getDate() % OFFLINE_QUESTIONS.length;
    return OFFLINE_QUESTIONS[dayIndex];
  }
}

/**
 * Analyze mood answers and return a score (1-10) and description.
 */
export async function analyzeMood(answers) {
  const prompt = `
    The user answered these mood questions: ${JSON.stringify(answers)}.
    Analyze their mental state and return a JSON object with:
    - score: a number from 1 to 10
    - description: a short, supportive 1-sentence summary of their vibe.
    - sentiment: one word ('positive', 'neutral', 'negative')
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("Using Local Empathy Engine for Mood Analysis.");
    const ansStr = JSON.stringify(answers).toLowerCase();
    
    if (ansStr.includes('sad') || ansStr.includes('heavy') || ansStr.includes('bad') || ansStr.includes('stress') || ansStr.includes('tired')) {
      return { score: 3, description: "It sounds like you're carrying a heavy load right now. I'm here for you.", sentiment: "negative" };
    }
    if (ansStr.includes('good') || ansStr.includes('great') || ansStr.includes('happy') || ansStr.includes('excited')) {
      return { score: 8, description: "You've got some great energy flowing today! Keep riding that wave.", sentiment: "positive" };
    }
    
    return { score: 5, description: "You seem to be in a reflective, steady mood. Taking it one step at a time.", sentiment: "neutral" };
  }
}

/**
 * Generate a response from "Milo" the Emotional LLM.
 */
export async function generateMiloResponse(moodScore, conversation, ageGroup = "13-19") {
  const context = `
    You are Milo, a warm, highly empathetic, and human-like emotional support companion for YuvaPulse.
    Your goal is to make the user feel truly heard and validated. 
    1. Acknowledge and validate their feelings first. Do not immediately jump to giving generic advice or robotic tips. 
    2. Speak like a caring human friend. Use natural conversational language, show genuine empathy, and ask gentle leading questions.
    3. If they ask for help or seem stuck, offer practical, relatable, and human-centered strategies.
    4. Keep responses concise enough for a chat interface, but deep enough to feel meaningful. Use emojis naturally.
    User Info: Age Group ${ageGroup}, Current Mood Score ${moodScore}/10.
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    const chat = model.startChat({
      history: conversation.map(msg => ({
        role: msg.is_milo ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      generationConfig: { maxOutputTokens: 250 },
    });
    const result = await chat.sendMessage(context);
    const text = result.response.text();
    return { text, options: ["Tell me more", "I'm okay now", "What can I do?"], action: null };
  } catch (err) {
    console.warn("Using Local Empathy Engine for Milo Chat.");
    
    const lastMsg = conversation[conversation.length - 1]?.text?.toLowerCase() || "";
    
    let reply = "I hear you, and I want you to know it's completely okay to feel that way. I'm right here with you. What's on your mind?";
    let opts = ["I'm just stressed", "Feeling a bit lonely", "I don't want to talk"];

    if (lastMsg.includes('stress') || lastMsg.includes('exam') || lastMsg.includes('homework') || lastMsg.includes('school')) {
      reply = "School and exams can feel like a massive crushing weight sometimes. 😔 It's completely valid that you're stressed. Remember to breathe. Have you taken a break in the last hour?";
      opts = ["Yes, I took a break", "No, I can't stop", "I need a distraction"];
    } else if (lastMsg.includes('lonely') || lastMsg.includes('friend') || lastMsg.includes('alone') || lastMsg.includes('hate me')) {
      reply = "Feeling isolated is one of the hardest things to carry. It's like you're in a crowded room but no one sees you. 💔 I see you. You matter. Do you want to process this together?";
      opts = ["Yes, please", "I just want to vent", "Can we play a game?"];
    } else if (lastMsg.includes('anx') || lastMsg.includes('panic') || lastMsg.includes('scared')) {
      reply = "Anxiety can feel so overwhelming, like your heart is racing a million miles an hour. 🫂 First, let's take a deep breath together. In through your nose... out through your mouth. You are safe here.";
      opts = ["Let's breathe together", "It's not helping", "I feel a bit better"];
    } else if (lastMsg.includes('happy') || lastMsg.includes('good') || lastMsg.includes('great')) {
      reply = "That’s so wonderful to hear! 🌟 It’s important to celebrate the good days. What made it so great?";
      opts = ["Just hanging out", "A good grade", "Everything in general"];
    } else if (lastMsg.includes('tired') || lastMsg.includes('sleep') || lastMsg.includes('exhausted')) {
      reply = "Mental exhaustion is just as real as physical exhaustion. You've been carrying a lot. It might be time to grant yourself permission to rest. 🛌 You don't have to be productive 24/7.";
      opts = ["I can't sleep", "You're right", "I have too much to do"];
    }
    
    return { text: reply, options: opts, action: null };
  }
}

/**
 * Detect early warning signs in conversation text using Gemini.
 */
export async function detectEarlyWarning(text) {
  const prompt = `
    Analyze the following user input for signs of high mental health risk, self-harm, or severe distress: "${text}".
    Return a JSON object with is_risk, primary_concern, and urgency.
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    const result = await model.generateContent(prompt);
    const resultText = result.response.text();
    const jsonStr = resultText.match(/\{.*\}/s)?.[0] || resultText;
    return JSON.parse(jsonStr);
  } catch (err) {
    const textLower = text.toLowerCase();
    const isRisk = textLower.includes('die') || textLower.includes('kill') || textLower.includes('harm') || textLower.includes('end it');
    return { 
      is_risk: isRisk, 
      primary_concern: isRisk ? 'potential crisis' : 'general', 
      urgency: isRisk ? 'critical' : 'low' 
    };
  }
}
