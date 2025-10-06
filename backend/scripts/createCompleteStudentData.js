const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function createCompleteStudentData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🏗️ CREATING COMPLETE STUDENT DATA');
    console.log('==================================');

    // Get all student users
    const studentUsers = await User.find({ role: 'student' });
    console.log(`Found ${studentUsers.length} student users`);

    // Check which ones have profiles
    const existingProfiles = await Student.find().populate('userId', 'email');
    const existingUserIds = existingProfiles.map(p => p.userId._id.toString());

    console.log(`Found ${existingProfiles.length} existing student profiles`);

    // Create comprehensive student data
    const studentData = [
      {
        name: 'AHAMED NASEER N',
        regNo: '23SUIT01',
        email: '23suit01@student.smartmentor.com',
        mobile: '9876543210'
      },
      {
        name: 'ANUSHIYA G',
        regNo: '23SUIT02',
        email: '23suit02@student.smartmentor.com',
        mobile: '9876543211'
      },
      {
        name: 'BALAJI KUMAR S',
        regNo: '23SUIT03',
        email: '23suit03@student.smartmentor.com',
        mobile: '9876543212'
      },
      {
        name: 'CHANDRIKA M',
        regNo: '23SUIT04',
        email: '23suit04@student.smartmentor.com',
        mobile: '9876543213'
      },
      {
        name: 'DIVYA DHARSHINI P',
        regNo: '23SUIT05',
        email: '23suit05@student.smartmentor.com',
        mobile: '9876543214'
      },
      {
        name: 'GOPIKA P',
        regNo: '23SUIT06',
        email: '23suit06@student.smartmentor.com',
        mobile: '9876543215'
      },
      {
        name: 'HAMSAVANI R R',
        regNo: '23SUIT07',
        email: '23suit07@student.smartmentor.com',
        mobile: '9876543216'
      },
      {
        name: 'ISWARYA LAKSHMI K',
        regNo: '23SUIT08',
        email: '23suit08@student.smartmentor.com',
        mobile: '9876543217'
      },
      {
        name: 'JEYASRI M',
        regNo: '23SUIT09',
        email: '23suit09@student.smartmentor.com',
        mobile: '9876543218'
      },
      {
        name: 'KAVITHA PRIYA S',
        regNo: '23SUIT10',
        email: '23suit10@student.smartmentor.com',
        mobile: '9876543219'
      },
      {
        name: 'Test Student SUCS01',
        regNo: '23SUCS01',
        email: '23sucs01@tcarts.in',
        mobile: '9876543220'
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const data of studentData) {
      // Find or create user
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        console.log(`Creating user: ${data.email}`);
        user = new User({
          email: data.email,
          password: 'student123', // Default password
          role: 'student'
        });
        await user.save();
      }

      // Check if student profile exists
      let student = await Student.findOne({ userId: user._id });
      
      if (!student) {
        console.log(`Creating student profile: ${data.name}`);
        student = new Student({
          userId: user._id,
          personalInfo: {
            name: data.name,
            regNo: data.regNo,
            dateOfBirth: new Date('2005-01-01'), // Default DOB
            gender: 'Other'
          },
          parentInfo: {
            fatherName: 'Father Name',
            fatherOccupation: 'Business',
            motherName: 'Mother Name',
            motherOccupation: 'Homemaker'
          },
          contactInfo: {
            mobile: data.mobile,
            address: 'Student Address, City, State - 123456'
          },
          academics: {
            subjects: [],
            totalMarks: 0,
            averagePercentage: 0,
            cgpa: 0
          },
          attendance: [],
          blackmarks: [],
          profileCompleted: true
        });
        await student.save();
        createdCount++;
      } else {
        console.log(`Updating student profile: ${data.name}`);
        student.personalInfo.name = data.name;
        student.personalInfo.regNo = data.regNo;
        student.contactInfo.mobile = data.mobile;
        student.profileCompleted = true;
        await student.save();
        updatedCount++;
      }
    }

    console.log('\n✅ STUDENT DATA CREATION COMPLETE');
    console.log('=================================');
    console.log(`✅ Created: ${createdCount} new student profiles`);
    console.log(`✅ Updated: ${updatedCount} existing student profiles`);

    // Verify final count
    const finalCount = await Student.countDocuments();
    console.log(`✅ Total student profiles: ${finalCount}`);

    console.log('\n📋 All Students:');
    const allStudents = await Student.find().populate('userId', 'email').sort({ 'personalInfo.regNo': 1 });
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo}) - ${student.userId?.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createCompleteStudentData();
