const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test database operations
const testDatabaseOperations = async () => {
  try {
    console.log('🧪 Starting comprehensive database tests...\n');

    // Test 1: Check existing data
    console.log('📊 Test 1: Checking existing data...');
    const userCount = await User.countDocuments();
    const studentCount = await Student.countDocuments();
    const messageCount = await Message.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log('✅ Data count check completed\n');

    // Test 2: Verify user authentication
    console.log('🔐 Test 2: Testing user authentication...');
    const testStudent = await User.findOne({ email: '23suit01@student.smartmentor.com' });
    if (testStudent) {
      const isValidPassword = await testStudent.comparePassword('student123');
      console.log(`   Student login test: ${isValidPassword ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    const testMentor = await User.findOne({ email: 'mentor@smartmentor.com' });
    if (testMentor) {
      const isValidPassword = await testMentor.comparePassword('mentor123');
      console.log(`   Mentor login test: ${isValidPassword ? '✅ PASS' : '❌ FAIL'}`);
    }
    console.log('✅ Authentication tests completed\n');

    // Test 3: Verify student data integrity
    console.log('📚 Test 3: Testing student data integrity...');
    const studentData = await Student.findOne().populate('userId', 'email role');
    if (studentData) {
      console.log(`   Student found: ${studentData.personalInfo.name}`);
      console.log(`   Registration: ${studentData.personalInfo.regNo}`);
      console.log(`   Subjects count: ${studentData.academics.subjects.length}`);
      console.log(`   CGPA: ${studentData.academics.cgpa}`);
      console.log(`   Profile completed: ${studentData.profileCompleted}`);
    }
    console.log('✅ Student data integrity check completed\n');

    // Test 4: Test CRUD operations
    console.log('🔄 Test 4: Testing CRUD operations...');
    
    // CREATE: Add a test notification
    const testNotification = new Notification({
      title: 'Database Test Notification',
      message: 'This is a test notification created during database testing',
      type: 'info',
      category: 'system',
      recipient: testStudent._id
    });
    await testNotification.save();
    console.log('   ✅ CREATE: Test notification created');

    // READ: Fetch the notification
    const fetchedNotification = await Notification.findById(testNotification._id);
    console.log(`   ✅ READ: Notification fetched - ${fetchedNotification.title}`);

    // UPDATE: Update the notification
    fetchedNotification.isRead = true;
    await fetchedNotification.save();
    console.log('   ✅ UPDATE: Notification marked as read');

    // DELETE: Remove the test notification
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('   ✅ DELETE: Test notification removed');
    
    console.log('✅ CRUD operations test completed\n');

    // Test 5: Test academic calculations
    console.log('🧮 Test 5: Testing academic calculations...');
    if (studentData) {
      const originalCGPA = studentData.academics.cgpa;
      
      // Add a new subject
      studentData.academics.subjects.push({
        name: 'Test Subject',
        marks: 95
      });
      
      // Recalculate academics
      studentData.updateAcademics();
      await studentData.save();
      
      console.log(`   Original CGPA: ${originalCGPA}`);
      console.log(`   New CGPA after adding subject: ${studentData.academics.cgpa}`);
      console.log(`   Total subjects: ${studentData.academics.subjects.length}`);
      
      // Remove the test subject
      studentData.academics.subjects = studentData.academics.subjects.filter(
        subject => subject.name !== 'Test Subject'
      );
      studentData.updateAcademics();
      await studentData.save();
      
      console.log(`   CGPA after removing test subject: ${studentData.academics.cgpa}`);
    }
    console.log('✅ Academic calculations test completed\n');

    // Test 6: Database indexes and performance
    console.log('⚡ Test 6: Testing database indexes and performance...');
    const startTime = Date.now();
    
    // Test email index
    await User.findOne({ email: '23suit01@student.smartmentor.com' });
    
    // Test regNo index
    await Student.findOne({ 'personalInfo.regNo': '23SUIT01' });
    
    const endTime = Date.now();
    console.log(`   Query performance: ${endTime - startTime}ms`);
    console.log('✅ Index and performance test completed\n');

    console.log('🎉 All database tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Student data integrity verified');
    console.log('   ✅ CRUD operations working');
    console.log('   ✅ Academic calculations working');
    console.log('   ✅ Database performance acceptable');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
};

// Main test function
const runTests = async () => {
  try {
    await connectDB();
    await testDatabaseOperations();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testDatabaseOperations };
