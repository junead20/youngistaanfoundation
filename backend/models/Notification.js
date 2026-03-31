const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['risk', 'info', 'success'], default: 'info' },
  userId: { type: String }, // Mentee ID (User.userId)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
