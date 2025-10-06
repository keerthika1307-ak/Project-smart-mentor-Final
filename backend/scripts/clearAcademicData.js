const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function clearAcademicData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 CLEARING ACADEMIC DATA FOR FRESH START');
    console.log('=========================================');

    // Get the remaining student
    const student = await Student.findOne().populate('userId', 'email');
    
    if (!student) {
      console.log('❌ No student found!');
      return;
    }

    console.log(`👤 Clearing academic data for: ${student.personalInfo.name}`);
    console.log(`📧 Email: ${student.userId.email}`);

    console.log('\n📊 BEFORE CLEARING:');
    console.log(`   Subjects: ${student.academics.subjects.length}`);
    console.log(`   Total Marks: ${student.academics.totalMarks}`);
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average: ${student.academics.averagePercentage?.toFixed(2)}%`);

    if (student.academics.subjects.length > 0) {
      console.log('\n📚 Current Subjects:');
      student.academics.subjects.forEach((subject, index) => {
        console.log(`   ${index + 1}. ${subject.name}: ${subject.marks}/100`);
      });
    }

    // Clear all academic data
    student.academics.subjects = [];
    student.academics.totalMarks = 0;
    student.academics.averagePercentage = 0;
    student.academics.cgpa = 0;

    await student.save();

    console.log('\n📊 AFTER CLEARING:');
    console.log(`   Subjects: ${student.academics.subjects.length}`);
    console.log(`   Total Marks: ${student.academics.totalMarks}`);
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average: ${student.academics.averagePercentage?.toFixed(2)}%`);

    console.log('\n✅ ACADEMIC DATA CLEARED!');
    console.log('=========================');
    console.log('🎯 Now the system is ready for realistic testing:');
    console.log('   1. Mentor can add marks for this student');
    console.log('   2. Student will see marks appear in real-time');
    console.log('   3. No mock data interfering with the flow');

    console.log('\n📋 STUDENT LOGIN CREDENTIALS:');
    console.log(`   Email: ${student.userId.email}`);
    console.log('   Password: student123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

clearAcademicData();
