import mongoose from "mongoose";

const WorkshopSchema = new mongoose.Schema({
  program: { type: String, enum: ["Bright Spark", "Gender Equality", "Youth Mentoring"], required: true },
  city: String,
  date: { type: Date, required: true },
  volunteer_id: String,
  volunteer_name: String,
  participants_count: Number,
  age_group: { type: String, enum: ["6-12", "13-19"] },
  pre_scores: {
    avg_confidence: Number,
    avg_mood: Number,
    avg_engagement: Number
  },
  post_scores: {
    avg_confidence: Number,
    avg_mood: Number,
    avg_engagement: Number
  },
  notes: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Workshop", WorkshopSchema);
