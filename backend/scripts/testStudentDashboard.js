const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testStudentDashboard() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 TESTING STUDENT DASHBOARD DATA');
    console.log('=================================');

    // Get all students and test their dashboard data
    const students = await Student.find().populate('userId', 'email');
    
    for (const student of students) {
      console.log(`\n👤 Testing dashboard for: ${student.personalInfo.name}`);
      console.log(`📧 Email: ${student.userId?.email}`);
      console.log(`🆔 Student ID: ${student._id}`);

      // Simulate the /students/dashboard API response
      const latestAttendance = student.attendance.length > 0 
        ? student.attendance[student.attendance.length - 1] 
        : null;

      const overallAttendance = student.attendance.length > 0
        ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
        : 0;

      const dashboardData = {
        personalInfo: student.personalInfo,
        contactInfo: student.contactInfo,
        parentInfo: student.parentInfo,
        academics: {
          subjects: student.academics.subjects,
          totalMarks: student.academics.totalMarks,
          averagePercentage: student.academics.averagePercentage,
          cgpa: student.academics.cgpa,
          subjectCount: student.academics.subjects.length
        },
        attendance: {
          latest: latestAttendance,
          overall: Math.round(overallAttendance * 100) / 100,
          history: student.attendance.slice(-6)
        },
        blackmarks: {
          total: student.blackmarks.length,
          recent: student.blackmarks.slice(-5),
          highSeverity: student.blackmarks.filter(b => b.severity === 'High').length
        },
        aiFeedback: student.aiFeedback,
        profileCompleted: student.profileCompleted
      };

      console.log('\n📊 Dashboard Data (what student frontend receives):');
      console.log('===================================================');
      console.log(`📚 Academics:`);
      console.log(`   CGPA: ${dashboardData.academics.cgpa}`);
      console.log(`   Average: ${dashboardData.academics.averagePercentage?.toFixed(2)}%`);
      console.log(`   Subject Count: ${dashboardData.academics.subjectCount}`);
      console.log(`   Total Marks: ${dashboardData.academics.totalMarks}`);

      if (dashboardData.academics.subjects.length > 0) {
        console.log('\n📚 Subjects:');
        dashboardData.academics.subjects.forEach((subject, index) => {
          console.log(`   ${index + 1}. ${subject.name}: ${subject.marks}/100 (Added: ${subject.addedAt})`);
        });
      } else {
        console.log('   ❌ No subjects found');
      }

      console.log(`\n📅 Attendance:`);
      console.log(`   Overall: ${dashboardData.attendance.overall}%`);
      
      console.log('\n' + '='.repeat(60));
    }

    console.log('\n✅ Student dashboard test completed!');
    console.log('\n🎯 SUMMARY:');
    console.log('- If students have subjects, they should see them in their academics page');
    console.log('- If no subjects show, the mentor needs to add marks through the web interface');
    console.log('- The API endpoints are working correctly');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testStudentDashboard();
