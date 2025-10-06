const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function checkStudentData() {
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

    console.log('\n📊 Current Student Academic Data:');
    console.log('================================');
    console.log(`Student: ${student.personalInfo.name}`);
    console.log(`Reg No: ${student.personalInfo.regNo}`);
    console.log(`Email: ${studentUser.email}`);

    console.log('\n📚 Subject Marks:');
    student.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks}/100 (${subject.marks}%)`);
    });

    console.log('\n📈 Academic Summary:');
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average Percentage: ${student.academics.averagePercentage?.toFixed(2) || 0}%`);
    console.log(`   Total Marks: ${student.academics.totalMarks || 0}`);

    console.log('\n📅 Attendance Records:');
    if (student.attendance.length > 0) {
      student.attendance.forEach(record => {
        console.log(`   ${record.month} ${record.year}: ${record.percentage.toFixed(1)}%`);
      });
      const overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
      console.log(`   Overall Attendance: ${overallAttendance.toFixed(1)}%`);
    } else {
      console.log('   No attendance records found');
    }

    console.log('\n✅ Data verification complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkStudentData();
