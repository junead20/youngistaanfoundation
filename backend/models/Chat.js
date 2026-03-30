import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_name: { type: String }, // For admin view only
  age_group: { type: String, enum: ['11-14', '15-19'], required: true },
  mood_score: { type: Number, min: 1, max: 10, required: true }, // 1-10 slider
  conversation: [{
    is_milo: { type: Boolean, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  action_taken: { 
    type: String, 
    enum: ['redirected_activities', 'redirected_communities', 'just_listened', 'alerted_volunteer'],
    default: 'just_listened'
  },
  needs_checking: { type: Boolean, default: false }, // If mood is low
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', ChatSchema);
