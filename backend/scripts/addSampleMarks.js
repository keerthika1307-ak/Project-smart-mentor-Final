const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function addSampleMarks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📚 ADDING SAMPLE MARKS FOR ALL STUDENTS');
    console.log('=======================================');

    // Get all students
    const students = await Student.find().populate('userId', 'email');
    console.log(`Found ${students.length} students`);

    // Sample subjects with varied marks
    const sampleSubjects = [
      { name: 'Mathematics', marks: [85, 78, 92, 88, 76, 94, 82, 90] },
      { name: 'Physics', marks: [78, 85, 76, 82, 88, 79, 91, 84] },
      { name: 'Chemistry', marks: [92, 88, 85, 90, 83, 87, 89, 86] },
      { name: 'English', marks: [73, 81, 79, 77, 85, 80, 78, 82] },
      { name: 'Computer Science', marks: [96, 89, 93, 87, 91, 88, 94, 90] }
    ];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      console.log(`\n👤 Adding marks for: ${student.personalInfo.name}`);

      // Clear existing subjects first
      student.academics.subjects = [];

      // Add 3-5 random subjects for each student
      const numSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects
      const selectedSubjects = sampleSubjects.slice(0, numSubjects);

      for (const subject of selectedSubjects) {
        const marks = subject.marks[i % subject.marks.length]; // Cycle through marks
        
        // Add some time variation (within last few hours)
        const hoursAgo = Math.random() * 6; // 0-6 hours ago
        const addedAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));

        student.academics.subjects.push({
          name: subject.name,
          marks: marks,
          addedAt: addedAt
        });

        console.log(`   ✅ ${subject.name}: ${marks}/100`);
      }

      // Update academic calculations
      student.updateAcademics();
      await student.save();

      console.log(`   📊 CGPA: ${student.academics.cgpa}, Average: ${student.academics.averagePercentage?.toFixed(1)}%`);
    }

    console.log('\n✅ SAMPLE MARKS ADDED SUCCESSFULLY!');
    console.log('===================================');
    console.log('🎯 Now both mentor and student interfaces should show marks correctly!');
    console.log('📊 Mentor side: Will show recent entries in the table');
    console.log('👤 Student side: Each student will see their subjects and CGPA');

    // Show summary
    console.log('\n📋 SUMMARY:');
    for (const student of students) {
      await student.populate('userId', 'email');
      console.log(`${student.personalInfo.name}: ${student.academics.subjects.length} subjects, CGPA: ${student.academics.cgpa}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

addSampleMarks();
