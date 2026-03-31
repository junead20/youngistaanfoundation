const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },       // "YYYY-MM-DD"
  userId: { type: String, required: true, index: true },     // anonymized
  persona: { type: String, enum: ['Caring Parent', 'Supportive Friend', 'Wise Mentor', 'General'], default: 'General' },
  emotion: { type: String, default: 'Unknown' },
  intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  cause: { type: String, default: '' },
  aiResponseSummary: { type: String, default: '' },
  interactionCount: { type: Number, default: 1 },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  stressCategory: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one log per user per day (upsert pattern)
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
