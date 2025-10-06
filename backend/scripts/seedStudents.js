const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleStudents = [
  {
    email: 'ahamed.naseer@student.smartmentor.com',
    password: 'student123',
    personalInfo: {
      name: 'AHAMED NASEER N',
      regNo: '23SUIT01',
      dateOfBirth: '2005-03-15',
      gender: 'Male',
      bloodGroup: 'B+',
      nationality: 'Indian',
      religion: 'Islam',
      caste: 'Muslim',
      category: 'General'
    },
    parentInfo: {
      fatherName: 'Naseer Ahmed',
      motherName: 'Fatima Naseer',
      fatherOccupation: 'Business',
      motherOccupation: 'Homemaker',
      annualIncome: 500000
    },
    contactInfo: {
      mobile: '+91 9876543210',
      alternateMobile: '+91 9876543211',
      email: 'ahamed.naseer@student.smartmentor.com',
      address: '123 Main Street, Chennai, Tamil Nadu - 600001'
    },
    academics: {
      subjects: [
        { name: 'Mathematics', marks: 85 },
        { name: 'Physics', marks: 78 },
        { name: 'Chemistry', marks: 82 },
        { name: 'Computer Science', marks: 92 }
      ]
    },
    attendance: [
      { month: 'September', year: 2024, daysPresent: 22, totalDays: 25, percentage: 88 },
      { month: 'August', year: 2024, daysPresent: 26, totalDays: 28, percentage: 93 }
    ]
  },
  {
    email: 'priya.sharma@student.smartmentor.com',
    password: 'student123',
    personalInfo: {
      name: 'PRIYA SHARMA',
      regNo: '23SUIT02',
      dateOfBirth: '2005-07-22',
      gender: 'Female',
      bloodGroup: 'A+',
      nationality: 'Indian',
      religion: 'Hindu',
      caste: 'General',
      category: 'General'
    },
    parentInfo: {
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      fatherOccupation: 'Engineer',
      motherOccupation: 'Teacher',
      annualIncome: 800000
    },
    contactInfo: {
      mobile: '+91 9876543212',
      alternateMobile: '+91 9876543213',
      email: 'priya.sharma@student.smartmentor.com',
      address: '456 Park Avenue, Mumbai, Maharashtra - 400001'
    },
    academics: {
      subjects: [
        { name: 'Mathematics', marks: 95 },
        { name: 'Physics', marks: 89 },
        { name: 'Chemistry', marks: 91 },
        { name: 'Biology', marks: 87 }
      ]
    },
    attendance: [
      { month: 'September', year: 2024, daysPresent: 24, totalDays: 25, percentage: 96 },
      { month: 'August', year: 2024, daysPresent: 27, totalDays: 28, percentage: 96 }
    ]
  },
  {
    email: 'rahul.kumar@student.smartmentor.com',
    password: 'student123',
    personalInfo: {
      name: 'RAHUL KUMAR',
      regNo: '23SUIT03',
      dateOfBirth: '2005-01-10',
      gender: 'Male',
      bloodGroup: 'O+',
      nationality: 'Indian',
      religion: 'Hindu',
      caste: 'OBC',
      category: 'OBC'
    },
    parentInfo: {
      fatherName: 'Suresh Kumar',
      motherName: 'Meera Kumar',
      fatherOccupation: 'Farmer',
      motherOccupation: 'Homemaker',
      annualIncome: 300000
    },
    contactInfo: {
      mobile: '+91 9876543214',
      alternateMobile: '+91 9876543215',
      email: 'rahul.kumar@student.smartmentor.com',
      address: '789 Village Road, Patna, Bihar - 800001'
    },
    academics: {
      subjects: [
        { name: 'Mathematics', marks: 72 },
        { name: 'Physics', marks: 68 },
        { name: 'Chemistry', marks: 75 },
        { name: 'Computer Science', marks: 88 }
      ]
    },
    attendance: [
      { month: 'September', year: 2024, daysPresent: 20, totalDays: 25, percentage: 80 },
      { month: 'August', year: 2024, daysPresent: 23, totalDays: 28, percentage: 82 }
    ]
  },
  {
    email: 'anita.patel@student.smartmentor.com',
    password: 'student123',
    personalInfo: {
      name: 'ANITA PATEL',
      regNo: '23SUIT04',
      dateOfBirth: '2005-11-05',
      gender: 'Female',
      bloodGroup: 'AB+',
      nationality: 'Indian',
      religion: 'Hindu',
      caste: 'General',
      category: 'General'
    },
    parentInfo: {
      fatherName: 'Kiran Patel',
      motherName: 'Nisha Patel',
      fatherOccupation: 'Doctor',
      motherOccupation: 'Nurse',
      annualIncome: 1200000
    },
    contactInfo: {
      mobile: '+91 9876543216',
      alternateMobile: '+91 9876543217',
      email: 'anita.patel@student.smartmentor.com',
      address: '321 Medical Colony, Ahmedabad, Gujarat - 380001'
    },
    academics: {
      subjects: [
        { name: 'Mathematics', marks: 90 },
        { name: 'Physics', marks: 85 },
        { name: 'Chemistry', marks: 88 },
        { name: 'Biology', marks: 94 }
      ]
    },
    attendance: [
      { month: 'September', year: 2024, daysPresent: 25, totalDays: 25, percentage: 100 },
      { month: 'August', year: 2024, daysPresent: 28, totalDays: 28, percentage: 100 }
    ]
  },
  {
    email: 'vikram.singh@student.smartmentor.com',
    password: 'student123',
    personalInfo: {
      name: 'VIKRAM SINGH',
      regNo: '23SUIT05',
      dateOfBirth: '2005-09-18',
      gender: 'Male',
      bloodGroup: 'B-',
      nationality: 'Indian',
      religion: 'Sikh',
      caste: 'General',
      category: 'General'
    },
    parentInfo: {
      fatherName: 'Harpreet Singh',
      motherName: 'Simran Kaur',
      fatherOccupation: 'Army Officer',
      motherOccupation: 'Government Employee',
      annualIncome: 900000
    },
    contactInfo: {
      mobile: '+91 9876543218',
      alternateMobile: '+91 9876543219',
      email: 'vikram.singh@student.smartmentor.com',
      address: '654 Cantonment Area, Chandigarh - 160001'
    },
    academics: {
      subjects: [
        { name: 'Mathematics', marks: 79 },
        { name: 'Physics', marks: 83 },
        { name: 'Chemistry', marks: 77 },
        { name: 'Computer Science', marks: 91 }
      ]
    },
    attendance: [
      { month: 'September', year: 2024, daysPresent: 23, totalDays: 25, percentage: 92 },
      { month: 'August', year: 2024, daysPresent: 25, totalDays: 28, percentage: 89 }
    ]
  }
];

async function seedStudents() {
  try {
    console.log('🌱 Starting to seed student data...');
    
    // Clear existing students and users (optional)
    console.log('🗑️ Clearing existing student data...');
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    
    // Drop any problematic indexes
    try {
      await Student.collection.dropIndexes();
      console.log('🗂️ Dropped existing indexes');
    } catch (error) {
      console.log('ℹ️ No indexes to drop or error dropping indexes');
    }
    
    console.log('👥 Creating students...');
    
    for (const studentData of sampleStudents) {
      // Create user account
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const user = new User({
        email: studentData.email,
        password: hashedPassword,
        role: 'student',
        isActive: true
      });
      await user.save();
      
      // Create student profile
      const student = new Student({
        userId: user._id,
        personalInfo: studentData.personalInfo,
        parentInfo: studentData.parentInfo,
        contactInfo: studentData.contactInfo,
        academics: studentData.academics,
        attendance: studentData.attendance,
        profileCompleted: true
      });
      
      // Calculate CGPA
      student.updateAcademics();
      await student.save();
      
      console.log(`✅ Created student: ${studentData.personalInfo.name} (${studentData.personalInfo.regNo})`);
    }
    
    console.log('🎉 Student data seeded successfully!');
    console.log(`📊 Total students created: ${sampleStudents.length}`);
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@smartmentor.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        email: 'admin@smartmentor.com',
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('👑 Admin user created: admin@smartmentor.com / admin123');
    }
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding function
seedStudents();
