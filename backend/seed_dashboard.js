const mongoose = require('mongoose');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const Notification = require('./models/Notification');
require('dotenv').config();

const seedDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const volunteerId = '69cae6886c2afe1f6ee908eb';

    // Clear existing test entries for these users
    await User.deleteMany({ userId: { $in: ['MBX1001', 'MBX1002'] } });
    await MoodEntry.deleteMany({ userId: { $in: ['MBX1001', 'MBX1002'] } });
    await Notification.deleteMany({ volunteerId });

    // 1. Create Mentees
    await User.create([
      { userId: 'MBX1001', nickname: 'Alex', age: 19, email: 'alex@test.com' },
      { userId: 'MBX1002', nickname: 'Jordan', age: 21, email: 'jordan@test.com' }
    ]);

    // 2. High Stress History for MBX1001 (At Risk)
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      await MoodEntry.create({
        userId: 'MBX1001',
        emotion: i > 3 ? 'Stressed' : 'Sad',
        stressLevel: i > 3 ? 8 : 6,
        timestamp: date,
        stressors: ['Studies', 'Sleep']
      });
    }

    // 3. Normal History for MBX1002
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        await MoodEntry.create({
          userId: 'MBX1002',
          emotion: 'Happy',
          stressLevel: 3,
          timestamp: date,
          stressors: []
        });
      }

    // 4. Create Notification for MBX1001
    await Notification.create({
      volunteerId,
      userId: 'MBX1001',
      message: '🚨 ALERT: Student MBX1001 just logged a HIGH stress mood (8/10). Please reach out.',
      type: 'risk'
    });

    console.log('Dashboard seed data created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedDashboard();
