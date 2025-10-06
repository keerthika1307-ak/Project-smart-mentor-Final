const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function cleanupToRealStudentsOnly() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 CLEANING UP TO REAL STUDENTS ONLY');
    console.log('====================================');

    // Keep only the main student: 23sucs01@tcarts.in
    const keepEmails = ['23sucs01@tcarts.in'];
    
    console.log('📋 Students to KEEP:');
    keepEmails.forEach((email, index) => {
      console.log(`${index + 1}. ${email}`);
    });

    // Get all student users
    const allStudentUsers = await User.find({ role: 'student' });
    console.log(`\n📊 Found ${allStudentUsers.length} student users in database`);

    // Get all student profiles
    const allStudentProfiles = await Student.find().populate('userId', 'email');
    console.log(`📊 Found ${allStudentProfiles.length} student profiles in database`);

    // Identify students to remove
    const usersToRemove = allStudentUsers.filter(user => !keepEmails.includes(user.email));
    const profilesToRemove = allStudentProfiles.filter(profile => 
      !profile.userId || !keepEmails.includes(profile.userId.email)
    );

    console.log(`\n🗑️ Will remove ${usersToRemove.length} student users:`);
    usersToRemove.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
    });

    console.log(`\n🗑️ Will remove ${profilesToRemove.length} student profiles:`);
    profilesToRemove.forEach((profile, index) => {
      const email = profile.userId?.email || 'NO EMAIL';
      console.log(`${index + 1}. ${profile.personalInfo.name} (${email})`);
    });

    // Remove student profiles first
    for (const profile of profilesToRemove) {
      console.log(`Removing profile: ${profile.personalInfo.name}`);
      await Student.findByIdAndDelete(profile._id);
    }

    // Remove user accounts
    for (const user of usersToRemove) {
      console.log(`Removing user: ${user.email}`);
      await User.findByIdAndDelete(user._id);
    }

    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('====================');

    // Verify final state
    const remainingUsers = await User.find({ role: 'student' });
    const remainingProfiles = await Student.find().populate('userId', 'email');

    console.log(`\n📊 FINAL STATE:`);
    console.log(`   Student Users: ${remainingUsers.length}`);
    console.log(`   Student Profiles: ${remainingProfiles.length}`);

    console.log('\n👤 REMAINING STUDENTS:');
    remainingProfiles.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId?.email}`);
      console.log(`   Subjects: ${student.academics.subjects.length}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log('');
    });

    if (remainingProfiles.length === 0) {
      console.log('❌ WARNING: No students remaining! You may need to create at least one student.');
    } else {
      console.log('✅ System now has only legitimate students!');
      console.log('🎯 All modules will now show only these real students.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

cleanupToRealStudentsOnly();
