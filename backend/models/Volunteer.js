const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expertise: { type: [String], default: ['General Support'] },
  ageGroups: { type: [String], default: ['13-18', '18-25'] },
  bio: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  activeSessions: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  createdAt: { type: Date, default: Date.now }
});

volunteerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

volunteerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Volunteer', volunteerSchema);
