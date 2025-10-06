const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function removeAllStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️ REMOVING ALL STUDENT DATA');
    console.log('============================');

    // Get all student users and profiles before deletion
    const studentUsers = await User.find({ role: 'student' });
    const studentProfiles = await Student.find().populate('userId', 'email');

    console.log(`📊 Found ${studentUsers.length} student users to remove`);
    console.log(`📊 Found ${studentProfiles.length} student profiles to remove`);

    if (studentUsers.length > 0) {
      console.log('\n👥 Student Users to be removed:');
      studentUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
      });
    }

    if (studentProfiles.length > 0) {
      console.log('\n👤 Student Profiles to be removed:');
      studentProfiles.forEach((profile, index) => {
        const email = profile.userId?.email || 'NO EMAIL';
        console.log(`${index + 1}. ${profile.personalInfo.name} (${profile.personalInfo.regNo}) - ${email}`);
      });
    }

    // Remove all student profiles first
    const deletedProfiles = await Student.deleteMany({});
    console.log(`\n✅ Deleted ${deletedProfiles.deletedCount} student profiles`);

    // Remove all student users
    const deletedUsers = await User.deleteMany({ role: 'student' });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} student users`);

    // Verify cleanup
    const remainingStudentUsers = await User.countDocuments({ role: 'student' });
    const remainingStudentProfiles = await Student.countDocuments();

    console.log('\n📊 VERIFICATION:');
    console.log(`   Remaining Student Users: ${remainingStudentUsers}`);
    console.log(`   Remaining Student Profiles: ${remainingStudentProfiles}`);

    if (remainingStudentUsers === 0 && remainingStudentProfiles === 0) {
      console.log('\n✅ ALL STUDENT DATA REMOVED SUCCESSFULLY!');
      console.log('=========================================');
      console.log('🎯 System is now completely clean');
      console.log('📝 Ready for mentor to add new students');
      console.log('🔄 New students can then register and login');
    } else {
      console.log('\n❌ Some student data may still remain');
    }

    // Show remaining users
    const allUsers = await User.find().sort({ role: 1, email: 1 });
    console.log('\n👥 REMAINING USERS IN SYSTEM:');
    console.log('============================');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

removeAllStudents();
