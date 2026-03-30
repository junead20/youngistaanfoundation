const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MoodEntry = require('./models/MoodEntry');
const User = require('./models/User');

dotenv.config();

const SEED_ENTRIES = [
  { emotion: 'Happy', stressLevel: 2, stressors: ['Health'], note: 'Feeling great after a morning walk!', timestamp: new Date(Date.now() - 86400000 * 3) },
  { emotion: 'Neutral', stressLevel: 5, stressors: ['Work'], note: 'Busy day but manageable.', timestamp: new Date(Date.now() - 86400000 * 2) },
  { emotion: 'Stressed', stressLevel: 8, stressors: ['Studies', 'Anxiety'], note: 'Exams are coming up next week. I feel overwhelmed.', timestamp: new Date(Date.now() - 86400000) },
  { emotion: 'Sad', stressLevel: 6, stressors: ['Family'], note: 'Missing home a bit today.', timestamp: new Date(Date.now() - 43200000) },
  { emotion: 'Happy', stressLevel: 3, stressors: ['Relationships'], note: 'Had a wonderful talk with a friend.', timestamp: new Date() },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Find the current user or use a dummy
    const user = await User.findOne() || { _id: new mongoose.Types.ObjectId() };
    
    // Add user ID to entries
    const entiresWithUser = SEED_ENTRIES.map(e => ({ ...e, userId: user._id }));

    await MoodEntry.deleteMany({});
    await MoodEntry.insertMany(entiresWithUser);

    console.log('✅ Seeded 5 Mood Entries');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
