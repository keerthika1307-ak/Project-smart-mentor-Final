const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testMentorAddMarks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all students
    const students = await Student.find().populate('userId', 'email');
    console.log('\n📊 Available Students:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo}) - ${student.userId?.email}`);
      console.log(`   Current subjects: ${student.academics.subjects.length}`);
    });

    if (students.length === 0) {
      console.log('❌ No students found! Please run seedData.js first.');
      return;
    }

    // Test adding marks to the first student
    const testStudent = students[0];
    console.log(`\n🧪 Testing marks addition for: ${testStudent.personalInfo.name}`);

    // Simulate the exact API call from mentor form
    const testSubjects = [
      { name: 'Mathematics', marks: 85 },
      { name: 'Physics', marks: 78 },
      { name: 'Chemistry', marks: 92 },
      { name: 'English', marks: 73 }
    ];

    console.log('\n📚 Adding test subjects:');
    for (const subject of testSubjects) {
      console.log(`\n➕ Adding ${subject.name}: ${subject.marks}/100`);
      
      // Check if subject already exists
      const existingSubjectIndex = testStudent.academics.subjects.findIndex(
        s => s.name.toLowerCase() === subject.name.toLowerCase()
      );

      if (existingSubjectIndex !== -1) {
        // Update existing subject
        console.log('   📝 Updating existing subject...');
        testStudent.academics.subjects[existingSubjectIndex].marks = subject.marks;
        testStudent.academics.subjects[existingSubjectIndex].addedAt = new Date();
      } else {
        // Add new subject
        console.log('   ➕ Adding new subject...');
        testStudent.academics.subjects.push({
          name: subject.name,
          marks: subject.marks,
          addedAt: new Date()
        });
      }

      // Update academic calculations
      testStudent.updateAcademics();
      await testStudent.save();

      console.log(`   ✅ ${subject.name} added successfully`);
      console.log(`   📊 Current CGPA: ${testStudent.academics.cgpa}`);
      console.log(`   📊 Average: ${testStudent.academics.averagePercentage?.toFixed(2)}%`);
    }

    console.log('\n📊 FINAL STUDENT STATE:');
    console.log('=======================');
    console.log(`Student: ${testStudent.personalInfo.name}`);
    console.log(`Total Subjects: ${testStudent.academics.subjects.length}`);
    console.log(`CGPA: ${testStudent.academics.cgpa}`);
    console.log(`Average: ${testStudent.academics.averagePercentage?.toFixed(2)}%`);
    console.log(`Total Marks: ${testStudent.academics.totalMarks}`);

    console.log('\n📚 All Subjects:');
    testStudent.academics.subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name}: ${subject.marks}/100 (Added: ${subject.addedAt})`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('🎯 Now check the mentor and student interfaces to see if data appears correctly.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testMentorAddMarks();
