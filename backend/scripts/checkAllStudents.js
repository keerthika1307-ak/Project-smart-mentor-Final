const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function checkAllStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 CURRENT DATABASE STATUS');
    console.log('==========================');

    // Check total users
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const mentorUsers = await User.countDocuments({ role: 'mentor' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`   - Students: ${studentUsers}`);
    console.log(`   - Mentors: ${mentorUsers}`);
    console.log(`   - Admins: ${adminUsers}`);

    // Check student profiles
    const students = await Student.find().populate('userId', 'email');
    console.log(`\n👤 Student Profiles: ${students.length}`);

    if (students.length > 0) {
      console.log('\n📋 Current Students:');
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
        console.log(`   Email: ${student.userId?.email}`);
        console.log(`   Subjects: ${student.academics.subjects.length}`);
      });
    }

    console.log('\n🎯 RECOMMENDATION:');
    if (students.length < 10) {
      console.log('❌ Not enough students for proper testing');
      console.log('💡 Need to create more students to test all modules properly');
      console.log('🔧 Will create comprehensive student data...');
    } else {
      console.log('✅ Sufficient students for testing');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAllStudents();
