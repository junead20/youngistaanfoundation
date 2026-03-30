import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Creative', 'Mindful', 'Physical', 'Social'], required: true },
  type: { type: String, enum: ['Self-Time', 'Interactive'], required: true },
  duration: { type: String }, // e.g., '10 mins'
  content: { type: String }, // Optional detailed instructions
  active: { type: Boolean, default: true }
});

export default mongoose.model('Activity', ActivitySchema);
