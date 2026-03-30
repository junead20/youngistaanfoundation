import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
  volunteer_id: String,
  volunteer_name: String,
  child_id: String,
  child_name: String,
  age_group: { type: String, enum: ["6-12", "13-19"], required: true },
  program: { type: String, enum: ["Bright Spark", "Gender Equality", "Youth Mentoring"], required: true },
  city: String,
  observation: String,
  observation_type: { 
    type: String, 
    enum: ["withdrawn", "not_interacting", "exam_stress", "bullying", "low_confidence", "anxiety", "positive_change", "other"],
    required: true
  },
  confidence_level: { type: String, enum: ["very_low", "low", "moderate", "high", "very_high"], default: "moderate" },
  mood_score: { type: Number, min: 1, max: 5 },
  session_type: { type: String, enum: ["online", "offline"], default: "online" },
  offline_sheet_url: String,
  offline_scores: {
    emotional_wellbeing: Number,
    social_interaction: Number,
    academic_engagement: Number,
    self_confidence: Number,
    overall: Number
  },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
  follow_up_needed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Volunteer", VolunteerSchema);