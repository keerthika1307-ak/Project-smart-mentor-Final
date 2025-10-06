const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testStudentAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test student
    const studentUser = await User.findOne({ email: '23sucs01@tcarts.in' });
    if (!studentUser) {
      console.log('❌ Student user not found');
      return;
    }

    // Simulate the API call that the frontend makes
    const student = await Student.findOne({ userId: studentUser._id })
      .populate('userId', 'email');
    
    if (!student) {
      console.log('❌ Student profile not found');
      return;
    }

    // Calculate overall attendance percentage
    const overallAttendance = student.attendance.length > 0
      ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
      : 0;

    // This is what the API returns to the frontend
    const dashboardData = {
      personalInfo: student.personalInfo,
      academics: {
        subjects: student.academics.subjects,
        totalMarks: student.academics.totalMarks,
        averagePercentage: student.academics.averagePercentage,
        cgpa: student.academics.cgpa,
        subjectCount: student.academics.subjects.length
      },
      attendance: {
        overall: Math.round(overallAttendance * 100) / 100,
        history: student.attendance.slice(-6)
      },
      blackmarks: {
        total: student.blackmarks.length
      }
    };

    console.log('\n📊 API Response Data (what frontend receives):');
    console.log('==============================================');
    console.log('📚 Academics:');
    console.log(`   CGPA: ${dashboardData.academics.cgpa}`);
    console.log(`   Average: ${dashboardData.academics.averagePercentage}%`);
    console.log(`   Subject Count: ${dashboardData.academics.subjectCount}`);
    console.log(`   Total Marks: ${dashboardData.academics.totalMarks}`);
    
    console.log('\n📚 Subjects:');
    dashboardData.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks} marks`);
    });

    console.log('\n📅 Attendance:');
    console.log(`   Overall: ${dashboardData.attendance.overall}%`);

    console.log('\n🎯 Frontend Dashboard Should Show:');
    console.log(`   Current CGPA: ${dashboardData.academics.cgpa}`);
    console.log(`   Attendance: ${Math.round(dashboardData.attendance.overall)}%`);
    console.log(`   Total Subjects: ${dashboardData.academics.subjectCount}`);

    console.log('\n✅ API test complete!');
    console.log('\n💡 If student dashboard is not showing these values:');
    console.log('   1. Student should refresh the dashboard page');
    console.log('   2. Check browser console for any JavaScript errors');
    console.log('   3. Clear browser cache and try again');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testStudentAPI();
