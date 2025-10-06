const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendAttendanceNotification } = require('../utils/emailService');

// Load environment variables
dotenv.config();

async function testAttendanceEmailWorkflow() {
  try {
    console.log('🚀 Starting Attendance Email Workflow Test...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test student (or create one if none exists)
    let testStudent = await Student.findOne().populate('userId', 'email');
    
    if (!testStudent) {
      console.log('📝 No students found. Creating a test student...');
      
      // Create a test user
      const testUser = new User({
        email: 'test.student@example.com',
        password: 'testpassword123',
        role: 'student'
      });
      await testUser.save();

      // Create a test student
      testStudent = new Student({
        userId: testUser._id,
        personalInfo: {
          name: 'Test Student',
          regNo: 'TEST001'
        },
        contactInfo: {
          mobile: '1234567890'
        },
        attendance: []
      });
      await testStudent.save();
      
      // Populate the userId field
      testStudent = await Student.findById(testStudent._id).populate('userId', 'email');
      console.log('✅ Test student created');
    }

    console.log(`📋 Using student: ${testStudent.personalInfo.name} (${testStudent.userId.email})`);

    // Create test attendance data
    const testAttendanceData = {
      month: 'October',
      year: 2025,
      daysPresent: 18,
      totalDays: 22,
      percentage: (18 / 22) * 100,
      addedAt: new Date()
    };

    console.log('\n📊 Test Attendance Data:');
    console.log(`   Month: ${testAttendanceData.month} ${testAttendanceData.year}`);
    console.log(`   Days Present: ${testAttendanceData.daysPresent}`);
    console.log(`   Total Days: ${testAttendanceData.totalDays}`);
    console.log(`   Percentage: ${testAttendanceData.percentage.toFixed(1)}%`);

    // Add attendance record to student
    testStudent.attendance.push(testAttendanceData);
    await testStudent.save();
    console.log('✅ Attendance record added to database');

    // Test email sending
    console.log('\n📧 Testing email notification...');
    try {
      const emailResult = await sendAttendanceNotification(testStudent, testAttendanceData);
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${emailResult.messageId}`);
      console.log(`   Recipient: ${testStudent.userId.email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Check if it's a configuration issue
      if (emailError.code === 'EAUTH') {
        console.log('💡 Tip: Check your email credentials in .env file');
      } else if (emailError.code === 'ECONNECTION') {
        console.log('💡 Tip: Check your internet connection and SMTP settings');
      }
    }

    console.log('\n🎯 Workflow Test Summary:');
    console.log('   ✅ Database connection: Success');
    console.log('   ✅ Student data: Available');
    console.log('   ✅ Attendance record: Added');
    console.log('   📧 Email notification: Check above for status');

    console.log('\n📋 API Endpoints Available:');
    console.log('   POST /api/students/:id/attendance - Add single attendance');
    console.log('   POST /api/students/attendance/bulk - Add bulk attendance');
    console.log('   GET /api/students/:id/attendance - Get attendance history');
    console.log('   DELETE /api/students/:id/attendance/:attendanceId - Delete attendance');

    console.log('\n🔧 Example API Usage:');
    console.log('   curl -X POST http://localhost:3001/api/students/' + testStudent._id + '/attendance \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log('   -d \'{"month":"November","year":2025,"daysPresent":20,"totalDays":22}\'');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testAttendanceEmailWorkflow();
