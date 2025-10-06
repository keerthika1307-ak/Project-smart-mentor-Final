const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}).select('email role createdAt lastLogin');
    
    console.log('\n📋 Users in database:');
    console.log('================================');
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Role: ${user.role}`);
      console.log(`📅 Created: ${user.createdAt}`);
      console.log(`🔐 Last Login: ${user.lastLogin || 'Never'}`);
      console.log('--------------------------------');
    });
    
    console.log(`\n📊 Total users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkUsers();
