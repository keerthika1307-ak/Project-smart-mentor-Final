const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkMohanUser() {
  try {
    console.log('Checking for mohan@gmail.com user...');
    
    // Check if user exists
    const user = await User.findOne({ email: 'mohan@gmail.com' });
    if (user) {
      console.log('✅ Found user:', {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
      
      // Check if student profile exists
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        console.log('✅ Found student profile:', {
          id: student._id,
          name: student.personalInfo.name,
          regNo: student.personalInfo.regNo,
          email: student.contactInfo.email
        });
      } else {
        console.log('❌ No student profile found for this user');
        
        // Create student profile
        console.log('Creating student profile for mohan@gmail.com...');
        const newStudent = new Student({
          userId: user._id,
          personalInfo: {
            name: 'MOHAN',
            regNo: '22sucs14',
            dateOfBirth: null,
            gender: 'Male'
          },
          parentInfo: {
            fatherName: '',
            motherName: '',
            fatherOccupation: '',
            motherOccupation: ''
          },
          contactInfo: {
            mobile: '',
            email: 'mohan@gmail.com',
            address: ''
          },
          profileCompleted: true
        });
        
        await newStudent.save();
        console.log('✅ Created student profile for MOHAN (22sucs14)');
      }
    } else {
      console.log('❌ User mohan@gmail.com not found');
      console.log('Creating user and student profile...');
      
      // Create user
      const newUser = new User({
        email: 'mohan@gmail.com',
        password: 'student123', // You should hash this properly
        role: 'student'
      });
      await newUser.save();
      console.log('✅ Created user for mohan@gmail.com');
      
      // Create student profile
      const newStudent = new Student({
        userId: newUser._id,
        personalInfo: {
          name: 'MOHAN',
          regNo: '22sucs14',
          dateOfBirth: null,
          gender: 'Male'
        },
        parentInfo: {
          fatherName: '',
          motherName: '',
          fatherOccupation: '',
          motherOccupation: ''
        },
        contactInfo: {
          mobile: '',
          email: 'mohan@gmail.com',
          address: ''
        },
        profileCompleted: true
      });
      
      await newStudent.save();
      console.log('✅ Created student profile for MOHAN (22sucs14)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkMohanUser();
