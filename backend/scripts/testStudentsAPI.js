const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testStudentsAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 TESTING /students?all=true API ENDPOINT');
    console.log('==========================================');

    // This simulates what the API endpoint does
    const query = {}; // No search filter
    
    const students = await Student.find(query)
      .populate('userId', 'email createdAt')
      .sort({ 'personalInfo.name': 1 });

    console.log(`📊 Found ${students.length} students in database`);

    // Format student data (same as API does)
    const formattedStudents = students.map(student => {
      let overallAttendance = 0;
      if (student.attendance.length > 0) {
        overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
      }

      return {
        _id: student._id,
        name: student.personalInfo.name || 'No Name',
        regNo: student.personalInfo.regNo || 'No Reg No',
        email: student.userId?.email || 'N/A',
        cgpa: student.academics.cgpa || 0,
        attendance: Math.round(overallAttendance * 100) / 100,
        blackmarks: student.blackmarks.length,
        profileCompleted: student.profileCompleted,
        createdAt: student.createdAt
      };
    });

    console.log('\n📋 API Response Data (what frontend receives):');
    console.log('==============================================');
    formattedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.regNo})`);
      console.log(`   ID: ${student._id}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   CGPA: ${student.cgpa}`);
      console.log(`   Attendance: ${student.attendance}%`);
      console.log('');
    });

    console.log(`✅ API should return ${formattedStudents.length} students`);
    
    if (formattedStudents.length === 0) {
      console.log('❌ No students found! This explains why dropdown is empty.');
    } else {
      console.log('✅ Students found! If dropdown is empty, there might be a frontend issue.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testStudentsAPI();
