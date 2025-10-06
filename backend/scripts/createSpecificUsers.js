const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function createSpecificUsers() {
  try {
    console.log('🚀 Creating specific test users for mentor-student testing...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up existing test users
    console.log('🧹 Cleaning up existing test users...');
    await User.deleteMany({ 
      email: { $in: ['thomas@gmail.com', '23sucs01@tcarts.in'] } 
    });
    await Student.deleteMany({ 
      'personalInfo.regNo': { $in: ['23SUCS01'] } 
    });

    // Create Mentor User (Thomas)
    console.log('👨‍🏫 Creating mentor user...');
    const mentorUser = new User({
      email: 'thomas@gmail.com',
      password: 'Abc@123',
      role: 'mentor'
    });
    await mentorUser.save();
    console.log('✅ Mentor created: thomas@gmail.com / Abc@123');

    // Create Student User
    console.log('👨‍🎓 Creating student user...');
    const studentUser = new User({
      email: '23sucs01@tcarts.in',
      password: 'Abc@123',
      role: 'student'
    });
    await studentUser.save();

    // Create Student Profile
    const studentProfile = new Student({
      userId: studentUser._id,
      personalInfo: {
        name: 'Test Student SUCS01',
        regNo: '23SUCS01',
        dateOfBirth: new Date('2001-05-15'),
        gender: 'Male'
      },
      parentInfo: {
        fatherName: 'Father Name',
        fatherOccupation: 'Engineer',
        motherName: 'Mother Name',
        motherOccupation: 'Teacher'
      },
      contactInfo: {
        mobile: '9876543210',
        address: 'Test Address, City, State'
      },
      academics: {
        subjects: [
          {
            name: 'Mathematics',
            marks: 0
          },
          {
            name: 'Computer Science', 
            marks: 0
          },
          {
            name: 'Physics',
            marks: 0
          }
        ],
        cgpa: 0,
        totalMarks: 0,
        averagePercentage: 0
      },
      attendance: [],
      profileCompleted: true
    });
    await studentProfile.save();
    console.log('✅ Student created: 23sucs01@tcarts.in / Abc@123');
    console.log(`   Student ID: ${studentProfile._id}`);
    console.log(`   User ID: ${studentUser._id}`);

    console.log('\n🎉 Specific test users created successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    TEST CREDENTIALS                         │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ MENTOR (Thomas):                                            │');
    console.log('│   Email: thomas@gmail.com                                   │');
    console.log('│   Password: Abc@123                                         │');
    console.log('│   Role: Mentor                                              │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ STUDENT (SUCS01):                                           │');
    console.log('│   Email: 23sucs01@tcarts.in                                 │');
    console.log('│   Password: Abc@123                                         │');
    console.log('│   Role: Student                                             │');
    console.log('│   Reg No: 23SUCS01                                          │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n🧪 Testing Instructions:');
    console.log('1. Login as Mentor (thomas@gmail.com) to add marks/attendance');
    console.log('2. Login as Student (23sucs01@tcarts.in) to verify visibility');
    console.log('3. Test both Academics and Attendance modules');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

createSpecificUsers();
