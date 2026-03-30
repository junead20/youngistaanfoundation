import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  age: Number,
  age_group: { type: String, enum: ["6-12", "13-19"], required: true },
  program: { type: String, enum: ["Bright Spark", "Gender Equality", "Youth Mentoring"], required: true },
  city: { type: String, required: true },
  mood_score: { type: Number, min: 1, max: 5, required: true },
  confidence_level: { type: String, enum: ["very_low", "low", "moderate", "high", "very_high"], default: "moderate" },
  engagement_score: { type: Number, min: 1, max: 10, default: 5 },
  text: String,
  help_flag: { type: Boolean, default: false },
  peer_support_used: { type: Boolean, default: false },
  input_source: { type: String, enum: ["self", "volunteer", "offline_sheet"], default: "self" },
  session_type: { type: String, enum: ["online", "offline"], default: "online" },
  daily_answers: [{
    question: String,
    answer: String,
    score: Number
  }],
  chatbot_session: {
    completed: { type: Boolean, default: false },
    mood_detected: String,
    suggestions_given: [String]
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Entry", EntrySchema);