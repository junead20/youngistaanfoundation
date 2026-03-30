import mongoose from 'mongoose';

const OfflineSessionSchema = new mongoose.Schema({
  volunteer_name: { type: String, required: true },
  child_name: { type: String, required: true },
  age: { type: Number },
  program: { type: String, required: true },
  city: { type: String, required: true },
  
  // Mood form digitally filled by volunteer
  mood_score: { type: Number, min: 1, max: 10, required: true },
  
  // Connect review
  one_on_one_done: { type: Boolean, default: false },
  volunteer_notes: { type: String }, // "Updates review about person"
  requires_mentor: { type: Boolean, default: false },
  
  // Which activities they participated in
  activities_done: [{ type: String }],
  
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('OfflineSession', OfflineSessionSchema);
