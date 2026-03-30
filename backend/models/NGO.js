const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  phone: { type: String },
  website: { type: String },
  email: { type: String },
  tags: { type: [String], default: [] },
  isHelpline: { type: Boolean, default: false },
  available24x7: { type: Boolean, default: false },
  location: { type: String, default: 'India' }
});

module.exports = mongoose.model('NGO', ngoSchema);
