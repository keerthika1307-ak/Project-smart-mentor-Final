const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testAddMarks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test student
    const studentUser = await User.findOne({ email: '23sucs01@tcarts.in' });
    if (!studentUser) {
      console.log('❌ Student user not found');
      return;
    }

    const student = await Student.findOne({ userId: studentUser._id });
    if (!student) {
      console.log('❌ Student profile not found');
      return;
    }

    console.log('\n📊 Before Adding English Marks:');
    console.log('================================');
    console.log(`Student: ${student.personalInfo.name}`);
    console.log(`Current subjects: ${student.academics.subjects.length}`);
    student.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks}/100`);
    });

    // Add English marks
    const subjectName = 'English';
    const marks = 73;

    console.log(`\n🔄 Adding ${subjectName} marks: ${marks}/100`);

    // Check if subject already exists
    const existingSubjectIndex = student.academics.subjects.findIndex(
      subject => subject.name.toLowerCase() === subjectName.toLowerCase()
    );

    if (existingSubjectIndex !== -1) {
      // Update existing subject
      console.log('   📝 Updating existing subject...');
      student.academics.subjects[existingSubjectIndex].marks = marks;
      student.academics.subjects[existingSubjectIndex].addedAt = new Date();
    } else {
      // Add new subject
      console.log('   ➕ Adding new subject...');
      student.academics.subjects.push({
        name: subjectName,
        marks: marks
      });
    }

    // Update academic calculations
    console.log('   🧮 Updating academic calculations...');
    student.updateAcademics();
    
    // Save the student
    console.log('   💾 Saving to database...');
    await student.save();

    console.log('\n📊 After Adding English Marks:');
    console.log('===============================');
    console.log(`Total subjects: ${student.academics.subjects.length}`);
    student.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks}/100`);
    });

    console.log('\n📈 Updated Academic Summary:');
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average Percentage: ${student.academics.averagePercentage?.toFixed(2) || 0}%`);
    console.log(`   Total Marks: ${student.academics.totalMarks || 0}`);

    console.log('\n✅ Marks added successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testAddMarks();
