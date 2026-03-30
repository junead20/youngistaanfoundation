import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate 3-5 random mood questions using Gemini.
 */
export async function generateMoodQuestions() {
  const prompt = `
    You are a friendly, teen-centric mental health assistant for YuvaPulse. 
    Generate 4 unique, creative, and non-threatening mood questions that help a user express their feelings without using clinical jargon (e.g., instead of "depression", use "low energy" or "heavy heart").
    Questions should be fun and interactive (e.g., "If your mood were a weather today, what would it be?").
    Return the result as a simple JSON array of strings.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Extract JSON from response (handling potential markdown formatting)
    const jsonStr = text.match(/\[.*\]/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Gemini Mood Questions Error:", err);
    return [
      "If your mood was a color today, which one would it be?",
      "On a scale of 1-10, how much energy do you have right now?",
      "What's one small thing that made you smile (even a little) today?",
      "If you could describe your day in one emoji, which one would it be?"
    ];
  }
}

/**
 * Analyze mood answers and return a score (1-10) and description.
 */
export async function analyzeMood(answers) {
  const prompt = `
    The user answered these mood questions: ${JSON.stringify(answers)}.
    Analyze their mental state and return a JSON object with:
    - score: a number from 1 to 10 (1 is very low/struggling, 10 is awesome)
    - description: a short, supportive 1-sentence summary of their vibe.
    - sentiment: one word ('positive', 'neutral', 'negative')
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Gemini Mood Analysis Error:", err);
    return { score: 5, description: "You seem to be in a reflective mood. I'm here to listen.", sentiment: "neutral" };
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
    2. Speak like a caring human friend. Use natural conversational language, show genuine empathy, and ask gentle leading questions to help them process their thoughts.
    3. If they ask for help or seem stuck, offer practical, relatable, and human-centered strategies instead of clinical jargon.
    4. Keep responses concise enough for a chat interface, but deep enough to feel meaningful. Use emojis naturally.
    5. If their mood is very low (score < 3), offer a listening ear and gentle grounding techniques.
    User Info: Age Group ${ageGroup}, Current Mood Score ${moodScore}/10.
  `;

  const chat = model.startChat({
    history: conversation.map(msg => ({
      role: msg.is_milo ? "model" : "user",
      parts: [{ text: msg.text }],
    })),
    generationConfig: { maxOutputTokens: 250 },
  });

  try {
    const result = await chat.sendMessage(context);
    const text = result.response.text();
    
    // Logic for suggesting options locally if needed, or ask Gemini to provide them
    // For now, let's just return the text.
    return { text, options: ["Tell me more", "I'm okay now", "What can I do?"], action: null };
  } catch (err) {
    console.error("Milo Gemini Error:", err);
    return { text: "Hey! I'm here. I had a tiny glitch but I'm listening. How are you feeling?", options: ["I'm okay", "Not great"], action: null };
  }
}/**
 * Detect early warning signs in conversation text using Gemini.
 */
export async function detectEarlyWarning(text) {
  const prompt = `
    Analyze the following user input for signs of high mental health risk, self-harm, or severe distress: "${text}".
    Return a JSON object with:
    - is_risk: boolean
    - primary_concern: string (e.g., 'academic stress', 'loneliness', 'crisis')
    - urgency: 'low', 'medium', 'high', 'critical'
  `;

  try {
    const result = await model.generateContent(prompt);
    const resultText = result.response.text();
    const jsonStr = resultText.match(/\{.*\}/s)?.[0] || resultText;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Gemini Early Warning Error:", err);
    return { is_risk: false, primary_concern: 'unknown', urgency: 'low' };
  }
}
