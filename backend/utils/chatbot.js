import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// OFFLINE EMPATHY ENGINE REPOSITORY V2
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
    console.warn("Using Local Empathy Engine V2 for Mood Questions.");
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
    console.warn("Using Local Empathy Engine V2 for Mood Analysis.");
    const ansStr = JSON.stringify(answers).toLowerCase();
    
    if (ansStr.includes('sad') || ansStr.includes('heavy') || ansStr.includes('bad') || ansStr.includes('stress') || ansStr.includes('tired') || ansStr.includes('😢') || ansStr.includes('😔')) {
      return { score: 3, description: "It sounds like you're carrying a heavy load right now. Please know that your feelings are valid, and I'm right here to listen.", sentiment: "negative" };
    }
    if (ansStr.includes('good') || ansStr.includes('great') || ansStr.includes('happy') || ansStr.includes('excited') || ansStr.includes('😊') || ansStr.includes('🤩')) {
      return { score: 8, description: "You've got some wonderful energy flowing today! It's great to see you shining like this.", sentiment: "positive" };
    }
    
    return { score: 5, description: "You seem to be in a steady, reflective space today. Taking things one step at a time is a superpower.", sentiment: "neutral" };
  }
}

// SIMULATED BRAIN PERSONALITY LOGIC (OFFLINE FALLBACK)
const PERSONALITY_TRAITS = {
  WARM: "I truly hear you.",
  VALIDATING: "It's completely okay to feel that way.",
  HUMAN: "I've had days like that too, where everything feels like a bit much.",
  CURIOSITY: "What's one thing that might make this ten percent easier?"
};

/**
 * Generate a response from "Milo" the Emotional LLM.
 */
export async function generateMiloResponse(moodScore, conversation, ageGroup = "13-19") {
  const lastMsg = conversation[conversation.length - 1]?.text?.toLowerCase() || "";

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    
    const context = `
      You are Milo, a warm, highly empathetic emotional support companion for YuvaPulse.
      User Info: Current Mood Score ${moodScore}/10. 
      Respond with deep validation and human warmth. Avoid generic AI advice.
    `;

    const chat = model.startChat({
      history: conversation.map(msg => ({
        role: msg.is_milo ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      generationConfig: { maxOutputTokens: 250 },
    });
    const result = await chat.sendMessage(context);
    return { text: result.response.text(), options: ["Tell me more", "I'm okay now", "What can I do?"], action: null };
  } catch (err) {
    console.warn("Using Local Empathy Engine V2 for Milo Chat.");
    
    let reply = `I'm listening so closely. ${PERSONALITY_TRAITS.VALIDATING} Even if it's hard to put into words, I'm here. ${PERSONALITY_TRAITS.CURIOSITY}`;
    let opts = ["It's just life", "I'm feeling lost", "Can we do an activity?"];

    // ADVANCED SITUATIONAL PATTERNS
    if (lastMsg.match(/exam|test|study|score|grade|marks|fail|school/)) {
      reply = `${PERSONALITY_TRAITS.HUMAN} Academic pressure can feel like an avalanche. 🏔️ It doesn't define who you are, though. Let's take a beat. Have you had anything to eat or drink recently?`;
      opts = ["I can't eat", "Just some water", "I need to study more"];
    } else if (lastMsg.match(/alone|lonely|isolated|friends|no one|forgotten|ignore/)) {
      reply = "That feeling of being on the outside looking in... it's really painful. 💔 I want you to know that in this moment, you aren't alone. I'm right here. Do you want to tell me about a time you felt truly connected?";
      opts = ["Yes, it was...", "I don't remember", "Just talk to me"];
    } else if (lastMsg.match(/anxious|panic|heart|racing|breathe|scared|fear/)) {
      reply = "I can feel the tension in those words. 🫂 Let's try something together. Right now, look around and find one thing that is your favorite color. Tell me what it is.";
      opts = ["I see a blue pen", "Everything is blurry", "I'm breathing now"];
    } else if (lastMsg.match(/tired|exhausted|sleep|burnout|can't do it/)) {
      reply = "It sounds like you've been running on empty for a while. 🛌 Rest isn't a reward for being busy; it's a requirement to be human. Can you give yourself permission to just 'be' for five minutes?";
      opts = ["I have too much to do", "Maybe you're right", "I'll try"];
    } else if (lastMsg.match(/happy|great|amazing|win|good news/)) {
      reply = `🌟 ${PERSONALITY_TRAITS.WARM} It makes my day to hear that you're having a win. Keep that spark alive! What was the highlight?`;
      opts = ["Just the vibe", "A small success", "Feeling lucky"];
    } else if (lastMsg.match(/hello|hi|hey|milo/)) {
      reply = "Hey! I'm so glad you're here. 🧸 I've been thinking about our space today. How has your heart been feeling since we last talked?";
      opts = ["Steady", "A bit heavy", "Surprisingly good"];
    }

    return { text: reply, options: opts, action: null };
  }
}

/**
 * Detect early warning signs in conversation text using Gemini.
 */
export async function detectEarlyWarning(text) {
  const textLower = text.toLowerCase();
  const criticalWords = ['die', 'kill', 'harm', 'end it', 'suicide', 'goodbye forever'];
  const isRisk = criticalWords.some(word => textLower.includes(word));

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('REPLACED_WITH')) throw new Error("API Key Missing");
    const result = await model.generateContent(`Analyze for risk: "${text}". Return JSON {is_risk, urgency}.`);
    const resultText = result.response.text();
    const jsonStr = resultText.match(/\{.*\}/s)?.[0] || resultText;
    return JSON.parse(jsonStr);
  } catch (err) {
    return { 
      is_risk: isRisk, 
      primary_concern: isRisk ? 'potential crisis' : 'general', 
      urgency: isRisk ? 'critical' : 'low' 
    };
  }
}
