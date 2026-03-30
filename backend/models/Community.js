import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }, // emoji or url
  member_count: { type: Number, default: 0 },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

export default mongoose.model('Community', CommunitySchema);
