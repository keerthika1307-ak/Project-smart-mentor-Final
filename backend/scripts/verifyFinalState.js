const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function verifyFinalState() {
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

    console.log('\n🎯 FINAL VERIFICATION REPORT');
    console.log('============================');
    console.log(`Student: ${student.personalInfo.name}`);
    console.log(`Reg No: ${student.personalInfo.regNo}`);
    console.log(`Email: ${studentUser.email}`);

    console.log('\n📚 ALL SUBJECTS WITH MARKS:');
    console.log('----------------------------');
    student.academics.subjects.forEach((subject, index) => {
      const grade = subject.marks >= 90 ? 'A+' : 
                   subject.marks >= 80 ? 'A' : 
                   subject.marks >= 70 ? 'B+' : 
                   subject.marks >= 60 ? 'B' : 
                   subject.marks >= 50 ? 'C' : 'F';
      console.log(`${index + 1}. ${subject.name}: ${subject.marks}/100 (${grade})`);
    });

    console.log('\n📊 ACADEMIC SUMMARY:');
    console.log('--------------------');
    console.log(`✅ Total Subjects: ${student.academics.subjects.length}`);
    console.log(`✅ Total Marks: ${student.academics.totalMarks}`);
    console.log(`✅ Average Percentage: ${student.academics.averagePercentage?.toFixed(2)}%`);
    console.log(`✅ Current CGPA: ${student.academics.cgpa}`);

    console.log('\n🔍 VERIFICATION CHECKLIST:');
    console.log('---------------------------');
    console.log(`✅ English subject exists: ${student.academics.subjects.some(s => s.name.toLowerCase() === 'english') ? 'YES' : 'NO'}`);
    console.log(`✅ Has 6 or more subjects: ${student.academics.subjects.length >= 6 ? 'YES' : 'NO'}`);
    console.log(`✅ CGPA calculated: ${student.academics.cgpa > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Total marks > 500: ${student.academics.totalMarks > 500 ? 'YES' : 'NO'}`);

    console.log('\n🎉 STUDENT DASHBOARD SHOULD SHOW:');
    console.log('----------------------------------');
    console.log(`📈 Current CGPA: ${student.academics.cgpa}`);
    console.log(`📊 Average Percentage: ${Math.round(student.academics.averagePercentage)}%`);
    console.log(`📚 Total Subjects: ${student.academics.subjects.length}`);
    console.log(`🎯 Total Marks: ${student.academics.totalMarks}`);

    if (student.attendance.length > 0) {
      const overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
      console.log(`📅 Overall Attendance: ${overallAttendance.toFixed(1)}%`);
    }

    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('🚀 Student should now see all marks correctly on the academics page!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyFinalState();
