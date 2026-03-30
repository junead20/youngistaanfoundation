const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  age: { type: Number },
  nickname: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  streakDays: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
