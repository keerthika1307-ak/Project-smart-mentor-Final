const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

// Load environment variables
dotenv.config();

async function setupTestUsers() {
  try {
    console.log('🚀 Setting up test users for Smart Mentor...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users (optional - be careful in production)
    console.log('🧹 Cleaning up existing test users...');
    await User.deleteMany({ email: { $in: ['admin@smartmentor.com', 'student@smartmentor.com', 'mentor@smartmentor.com'] } });
    await Student.deleteMany({ 'personalInfo.regNo': { $in: ['TEST001', 'STU001'] } });

    // Create Admin User
    console.log('👨‍💼 Creating admin user...');
    const adminUser = new User({
      email: 'admin@smartmentor.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Admin created: admin@smartmentor.com / admin123');

    // Create Mentor User
    console.log('👨‍🏫 Creating mentor user...');
    const mentorUser = new User({
      email: 'mentor@smartmentor.com',
      password: 'mentor123',
      role: 'mentor'
    });
    await mentorUser.save();
    console.log('✅ Mentor created: mentor@smartmentor.com / mentor123');

    // Create Student User
    console.log('👨‍🎓 Creating student user...');
    const studentUser = new User({
      email: 'student@smartmentor.com',
      password: 'student123',
      role: 'student'
    });
    await studentUser.save();

    // Create Student Profile
    const studentProfile = new Student({
      userId: studentUser._id,
      personalInfo: {
        name: 'John Doe',
        regNo: 'STU001',
        dateOfBirth: new Date('2000-01-15'),
        gender: 'Male'
      },
      parentInfo: {
        fatherName: 'Robert Doe',
        fatherOccupation: 'Engineer',
        motherName: 'Jane Doe',
        motherOccupation: 'Teacher'
      },
      contactInfo: {
        mobile: '9876543210',
        address: '123 Main Street, City, State'
      },
      profileCompleted: true
    });
    await studentProfile.save();
    console.log('✅ Student created: student@smartmentor.com / student123');

    // Create another test student for the form you're trying to register
    console.log('👨‍🎓 Creating test student for form...');
    const formStudentUser = new User({
      email: '23sut01@student.smartmentor.com',
      password: 'password123',
      role: 'student'
    });
    await formStudentUser.save();

    const formStudentProfile = new Student({
      userId: formStudentUser._id,
      personalInfo: {
        name: 'AILAMED NASEER N',
        regNo: '23SUT01',
        dateOfBirth: new Date('2001-09-08'),
        gender: 'Male'
      },
      parentInfo: {
        fatherName: 'Naseer Ahmed',
        fatherOccupation: 'Business',
        motherName: 'Fatima Naseer',
        motherOccupation: 'Housewife'
      },
      contactInfo: {
        mobile: '9876543210',
        address: 'Indore, MP'
      },
      profileCompleted: true
    });
    await formStudentProfile.save();
    console.log('✅ Form student created: 23sut01@student.smartmentor.com / password123');

    console.log('\n🎉 Test users setup completed successfully!');
    console.log('\n📋 Available Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    LOGIN CREDENTIALS                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ ADMIN:                                                      │');
    console.log('│   Email: admin@smartmentor.com                              │');
    console.log('│   Password: admin123                                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ MENTOR:                                                     │');
    console.log('│   Email: mentor@smartmentor.com                             │');
    console.log('│   Password: mentor123                                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ STUDENT:                                                    │');
    console.log('│   Email: student@smartmentor.com                           │');
    console.log('│   Password: student123                                      │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ FORM STUDENT:                                               │');
    console.log('│   Email: 23sut01@student.smartmentor.com                    │');
    console.log('│   Password: password123                                     │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n💡 Tips:');
    console.log('   • Use admin account to manage students and view analytics');
    console.log('   • Use mentor account to add attendance and marks');
    console.log('   • Use student account to view personal dashboard');
    console.log('   • Admin secret for new admin registration: 123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    if (error.code === 11000) {
      console.log('💡 Some users may already exist. Try logging in with existing credentials.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the setup
setupTestUsers();
