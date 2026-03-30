const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  emotion: { type: String, enum: ['Happy', 'Neutral', 'Sad', 'Stressed'], required: true },
  stressors: { type: [String], default: [] },
  stressLevel: { type: Number, min: 1, max: 10, required: true },
  note: { type: String, default: '' },
  stressCategory: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  timestamp: { type: Date, default: Date.now }
});

// Auto-compute stress category
moodEntrySchema.pre('save', function (next) {
  if (this.stressLevel <= 3) this.stressCategory = 'Low';
  else if (this.stressLevel <= 6) this.stressCategory = 'Medium';
  else this.stressCategory = 'High';
  next();
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
