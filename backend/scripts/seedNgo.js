require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Volunteer = require('../models/Volunteer');

async function seedNgoAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'srivatsav3d@gmail.com';
    const password = 'NgoAdmin!123';

    // Check if exists
    let admin = await Volunteer.findOne({ email });

    if (!admin) {
      console.log('Creating NGO admin account...');
      
      admin = await Volunteer.create({
        name: 'NGO Admin',
        email: email,
        password: password,
        expertise: ['System Administration'],
        bio: 'Internal NGO Administrative Account',
        role: 'ngo',
        isAvailable: false
      });
      console.log('✅ Admin account created successfully!');
    } else {
      console.log('⚠️ Admin account already exists. Updating role to "ngo"...');
      admin.role = 'ngo';
      await admin.save();
      console.log('✅ Role updated successfully!');
    }

    console.log('\n--- Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------\n');

  } catch (error) {
    console.error('❌ Error seeding NGO admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  }
}

seedNgoAdmin();
