const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function cleanupMockData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 CLEANING UP MOCK DATA');
    console.log('========================');

    // First, let's see what students we have
    const allStudents = await Student.find().populate('userId', 'email');
    console.log('\n📊 Current Students in Database:');
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo}) - ${student.userId?.email}`);
      console.log(`   Subjects: ${student.academics.subjects.length}`);
    });

    // Keep only the main test student (23SUCS01)
    const keepEmail = '23sucs01@tcarts.in';
    const keepStudent = await Student.findOne().populate('userId', 'email').where('userId').in(
      await User.find({ email: keepEmail }).select('_id')
    );

    if (!keepStudent) {
      console.log(`❌ Main test student (${keepEmail}) not found!`);
      return;
    }

    console.log(`\n✅ Keeping student: ${keepStudent.personalInfo.name} (${keepEmail})`);

    // Remove all other students and their user accounts
    const studentsToRemove = allStudents.filter(s => s.userId?.email !== keepEmail);
    
    console.log(`\n🗑️ Removing ${studentsToRemove.length} mock students:`);
    for (const student of studentsToRemove) {
      console.log(`   - ${student.personalInfo.name} (${student.userId?.email})`);
      
      // Delete the user account
      if (student.userId) {
        await User.findByIdAndDelete(student.userId._id);
      }
      
      // Delete the student profile
      await Student.findByIdAndDelete(student._id);
    }

    // Clean up the kept student's academic data - remove all subjects
    console.log(`\n🧹 Cleaning academic data for ${keepStudent.personalInfo.name}:`);
    console.log(`   - Removing ${keepStudent.academics.subjects.length} subjects`);
    
    keepStudent.academics.subjects = [];
    keepStudent.academics.totalMarks = 0;
    keepStudent.academics.averagePercentage = 0;
    keepStudent.academics.cgpa = 0;
    
    await keepStudent.save();

    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('====================');
    console.log(`✅ Kept student: ${keepStudent.personalInfo.name} (${keepStudent.personalInfo.regNo})`);
    console.log('✅ Removed all mock students');
    console.log('✅ Cleared all academic subjects');
    console.log('\n🎯 Now you can test adding marks fresh from the mentor interface!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

cleanupMockData();
