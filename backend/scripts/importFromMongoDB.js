const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function importFromMongoDB() {
  try {
    console.log('🔍 Connecting to MongoDB to fetch existing student data...');
    
    // Clear existing data first
    console.log('🗑️ Clearing existing student data...');
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    
    // Get the raw collection data directly from MongoDB
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');
    
    // Fetch all documents from the students collection
    const rawStudents = await studentsCollection.find({}).toArray();
    
    console.log(`📊 Found ${rawStudents.length} students in MongoDB collection`);
    
    if (rawStudents.length === 0) {
      console.log('⚠️ No students found in the collection. Please check your database.');
      return;
    }
    
    // Process each student
    for (const rawStudent of rawStudents) {
      console.log('\n📝 Processing student:', {
        id: rawStudent._id,
        name: rawStudent.name,
        registerNumber: rawStudent.registerNumber,
        rawData: rawStudent
      });
      
      // Extract data from the raw document
      const studentName = rawStudent.name || 'Unknown Name';
      const registerNumber = rawStudent.registerNumber || 'No Reg No';
      const email = rawStudent.email || `${registerNumber.toLowerCase()}@student.smartmentor.com`;
      
      // Create user account first
      const hashedPassword = await bcrypt.hash('student123', 10);
      const user = new User({
        email: email,
        password: hashedPassword,
        role: 'student',
        isActive: true
      });
      await user.save();
      
      // Create student profile with proper structure
      const student = new Student({
        userId: user._id,
        personalInfo: {
          name: studentName,
          regNo: registerNumber,
          dateOfBirth: rawStudent.dateOfBirth || new Date('2005-01-01'),
          gender: rawStudent.gender || 'Not Specified',
          bloodGroup: rawStudent.bloodGroup,
          nationality: 'Indian',
          religion: rawStudent.religion,
          caste: rawStudent.caste,
          category: rawStudent.category || 'General'
        },
        parentInfo: {
          fatherName: rawStudent.fatherName || 'Father Name',
          motherName: rawStudent.motherName || 'Mother Name',
          fatherOccupation: rawStudent.fatherOccupation || 'Not Specified',
          motherOccupation: rawStudent.motherOccupation || 'Not Specified',
          annualIncome: rawStudent.annualIncome || 500000
        },
        contactInfo: {
          mobile: rawStudent.mobile || '+91 9876543210',
          alternateMobile: rawStudent.alternateMobile,
          email: email,
          address: rawStudent.address || 'Address Not Provided',
          aadharNo: rawStudent.aadharNo,
          abcId: rawStudent.abcId
        },
        academics: {
          subjects: rawStudent.subjects || [],
          totalMarks: rawStudent.totalMarks || 0,
          averagePercentage: rawStudent.averagePercentage || 0,
          cgpa: rawStudent.cgpa || 0,
          grade: rawStudent.grade || 'Not Calculated'
        },
        attendance: rawStudent.attendance || [],
        blackmarks: rawStudent.blackmarks || [],
        profileCompleted: true,
        department: rawStudent.department || 'Computer Science Engineering',
        batch: rawStudent.batch || '2023-2027',
        currentSemester: rawStudent.currentSemester || 1,
        overallAttendance: rawStudent.overallAttendance || 85,
        isActive: rawStudent.isActive !== undefined ? rawStudent.isActive : true
      });
      
      // Calculate CGPA if subjects exist
      if (student.academics.subjects && student.academics.subjects.length > 0) {
        student.updateAcademics();
      }
      
      await student.save();
      
      console.log(`✅ Created student: ${studentName} (${registerNumber})`);
      console.log(`   Email: ${email}`);
      console.log(`   Mobile: ${student.contactInfo.mobile}`);
    }
    
    console.log('\n🎉 All students imported successfully!');
    
    // Display final summary
    const finalStudents = await Student.find({}).populate('userId', 'email');
    console.log('\n📋 Final Students List:');
    console.log('================================');
    
    finalStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId?.email}`);
      console.log(`   Mobile: ${student.contactInfo.mobile}`);
      console.log(`   Department: ${student.department}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log(`   Attendance: ${student.overallAttendance}%`);
      console.log('   ---');
    });
    
    console.log(`\n📊 Total students imported: ${finalStudents.length}`);
    
    // Ensure admin user exists
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
    console.error('❌ Error importing students:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the import function
importFromMongoDB();
