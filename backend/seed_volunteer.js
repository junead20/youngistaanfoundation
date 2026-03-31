const mongoose = require('mongoose');
const Volunteer = require('./models/Volunteer');
require('dotenv').config();

const seedVolunteer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'volunteer@test.com';
    const password = 'password123'; // Will be hashed by model pre-save hook

    const existing = await Volunteer.findOne({ email });
    if (existing) {
      console.log('Test volunteer already exists');
      process.exit(0);
    }

    await Volunteer.create({
      name: 'Test Volunteer',
      email,
      password,
      expertise: ['General Support'],
      role: 'volunteer'
    });

    console.log('Test volunteer created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding volunteer:', err.message);
    process.exit(1);
  }
};

seedVolunteer();
