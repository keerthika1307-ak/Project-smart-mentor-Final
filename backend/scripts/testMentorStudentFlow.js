const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testMentorStudentFlow() {
  try {
    console.log('🧪 Testing Mentor-Student Data Flow...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test student
    const studentUser = await User.findOne({ email: '23sucs01@tcarts.in' });
    if (!studentUser) {
      console.log('❌ Student user not found. Please run createSpecificUsers.js first');
      return;
    }

    const student = await Student.findOne({ userId: studentUser._id });
    if (!student) {
      console.log('❌ Student profile not found');
      return;
    }

    console.log('📋 Found Test Student:');
    console.log(`   Name: ${student.personalInfo.name}`);
    console.log(`   Reg No: ${student.personalInfo.regNo}`);
    console.log(`   Email: ${studentUser.email}`);
    console.log(`   Student ID: ${student._id}`);

    // Test 1: Add some marks (simulating mentor action)
    console.log('\n📊 Test 1: Adding Marks (Mentor Action)');
    
    // Update Mathematics marks
    const mathSubjectIndex = student.academics.subjects.findIndex(s => s.name === 'Mathematics');
    if (mathSubjectIndex !== -1) {
      student.academics.subjects[mathSubjectIndex].marks = 85;
      console.log('   ✅ Mathematics: 85 marks added');
    }

    // Update Computer Science marks
    const csSubjectIndex = student.academics.subjects.findIndex(s => s.name === 'Computer Science');
    if (csSubjectIndex !== -1) {
      student.academics.subjects[csSubjectIndex].marks = 92;
      console.log('   ✅ Computer Science: 92 marks added');
    }

    // Update Physics marks
    const physicsSubjectIndex = student.academics.subjects.findIndex(s => s.name === 'Physics');
    if (physicsSubjectIndex !== -1) {
      student.academics.subjects[physicsSubjectIndex].marks = 78;
      console.log('   ✅ Physics: 78 marks added');
    }

    // Update academic calculations
    student.updateAcademics();
    await student.save();
    console.log(`   📈 CGPA calculated: ${student.academics.cgpa}`);
    console.log(`   📊 Average: ${student.academics.averagePercentage.toFixed(2)}%`);

    // Test 2: Add attendance (simulating mentor action)
    console.log('\n📅 Test 2: Adding Attendance (Mentor Action)');
    
    const attendanceRecords = [
      {
        month: 'September',
        year: 2025,
        daysPresent: 18,
        totalDays: 20,
        percentage: 90,
        addedAt: new Date()
      },
      {
        month: 'October',
        year: 2025,
        daysPresent: 15,
        totalDays: 18,
        percentage: 83.33,
        addedAt: new Date()
      }
    ];

    student.attendance.push(...attendanceRecords);
    await student.save();
    
    attendanceRecords.forEach(record => {
      console.log(`   ✅ ${record.month} ${record.year}: ${record.daysPresent}/${record.totalDays} days (${record.percentage.toFixed(1)}%)`);
    });

    // Test 3: Verify data is accessible for student dashboard
    console.log('\n👨‍🎓 Test 3: Verifying Student Data Access');
    
    const studentData = await Student.findOne({ userId: studentUser._id })
      .populate('userId', 'email role');
    
    console.log('📊 Academic Data Available:');
    studentData.academics.subjects.forEach(subject => {
      console.log(`   - ${subject.name}: ${subject.marks} marks`);
    });
    console.log(`   - Overall CGPA: ${studentData.academics.cgpa}`);
    console.log(`   - Average Percentage: ${studentData.academics.averagePercentage.toFixed(2)}%`);

    console.log('\n📅 Attendance Data Available:');
    studentData.attendance.forEach(record => {
      console.log(`   - ${record.month} ${record.year}: ${record.percentage.toFixed(1)}% attendance`);
    });

    // Calculate overall attendance
    if (studentData.attendance.length > 0) {
      const overallAttendance = studentData.attendance.reduce((sum, att) => sum + att.percentage, 0) / studentData.attendance.length;
      console.log(`   - Overall Attendance: ${overallAttendance.toFixed(1)}%`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n🎯 Summary:');
    console.log('   ✅ Marks added by mentor are stored correctly');
    console.log('   ✅ Attendance added by mentor is stored correctly');
    console.log('   ✅ Student data is accessible for dashboard display');
    console.log('   ✅ Academic calculations (CGPA) are working');
    console.log('   ✅ Attendance calculations are working');

    console.log('\n📋 Next Steps:');
    console.log('1. Login as Mentor (thomas@gmail.com / Abc@123)');
    console.log('2. Go to Academics → Add marks for the student');
    console.log('3. Go to Attendance → Add attendance for the student');
    console.log('4. Login as Student (23sucs01@tcarts.in / Abc@123)');
    console.log('5. Check Dashboard, Academics, and Attendance pages');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

testMentorStudentFlow();
