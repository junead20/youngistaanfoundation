const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  authorNickname: { type: String, default: 'Anonymous' },
  content: { type: String, required: true, maxlength: 500 },
  tags: { type: [String], default: [] },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
