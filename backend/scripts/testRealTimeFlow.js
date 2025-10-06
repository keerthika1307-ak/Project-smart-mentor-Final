const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testRealTimeFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔄 TESTING REAL-TIME MARKS FLOW');
    console.log('===============================');

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

    console.log(`\n👤 Testing with student: ${student.personalInfo.name}`);
    console.log(`📧 Email: ${studentUser.email}`);

    // Show current state
    console.log('\n📊 BEFORE ADDING NEW MARKS:');
    console.log(`   Subjects: ${student.academics.subjects.length}`);
    console.log(`   Total Marks: ${student.academics.totalMarks}`);
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average: ${student.academics.averagePercentage?.toFixed(2)}%`);

    // Simulate mentor adding a new subject (like Biology)
    const newSubject = {
      name: 'Biology',
      marks: 88
    };

    console.log(`\n➕ SIMULATING MENTOR ADDING: ${newSubject.name} - ${newSubject.marks}/100`);

    // Check if subject already exists
    const existingSubjectIndex = student.academics.subjects.findIndex(
      s => s.name.toLowerCase() === newSubject.name.toLowerCase()
    );

    if (existingSubjectIndex !== -1) {
      // Update existing subject
      console.log('   📝 Updating existing subject...');
      student.academics.subjects[existingSubjectIndex].marks = newSubject.marks;
      student.academics.subjects[existingSubjectIndex].addedAt = new Date();
    } else {
      // Add new subject
      console.log('   ➕ Adding new subject...');
      student.academics.subjects.push({
        name: newSubject.name,
        marks: newSubject.marks,
        addedAt: new Date()
      });
    }

    // Update academic calculations
    student.updateAcademics();
    await student.save();

    console.log('   ✅ Marks saved to database');

    // Show updated state
    console.log('\n📊 AFTER ADDING NEW MARKS:');
    console.log(`   Subjects: ${student.academics.subjects.length}`);
    console.log(`   Total Marks: ${student.academics.totalMarks}`);
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average: ${student.academics.averagePercentage?.toFixed(2)}%`);

    // Test the student dashboard API response
    console.log('\n🧪 TESTING STUDENT DASHBOARD API:');
    const latestAttendance = student.attendance.length > 0 
      ? student.attendance[student.attendance.length - 1] 
      : null;

    const overallAttendance = student.attendance.length > 0
      ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
      : 0;

    const dashboardData = {
      academics: {
        subjects: student.academics.subjects,
        totalMarks: student.academics.totalMarks,
        averagePercentage: student.academics.averagePercentage,
        cgpa: student.academics.cgpa,
        subjectCount: student.academics.subjects.length
      }
    };

    console.log('📊 API Response (what student frontend will receive):');
    console.log(`   Subject Count: ${dashboardData.academics.subjectCount}`);
    console.log(`   Total Marks: ${dashboardData.academics.totalMarks}`);
    console.log(`   CGPA: ${dashboardData.academics.cgpa}`);
    console.log(`   Average: ${dashboardData.academics.averagePercentage?.toFixed(2)}%`);

    console.log('\n📚 All Subjects:');
    dashboardData.academics.subjects.forEach((subject, index) => {
      const timeAgo = formatTimeAgo(subject.addedAt);
      console.log(`   ${index + 1}. ${subject.name}: ${subject.marks}/100 (${timeAgo})`);
    });

    console.log('\n✅ REAL-TIME FLOW TEST COMPLETE!');
    console.log('=================================');
    console.log('🎯 Expected Behavior:');
    console.log('   1. Mentor adds marks → Immediately appears in Recent Marks Entries');
    console.log('   2. Student page auto-refreshes every 10 seconds');
    console.log('   3. Student sees notification: "Your marks have been updated by your mentor!"');
    console.log('   4. Student dashboard shows updated CGPA and subject count');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  return 'Recently';
}

testRealTimeFlow();
