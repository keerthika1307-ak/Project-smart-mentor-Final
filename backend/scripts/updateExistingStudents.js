const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateExistingStudents() {
  try {
    console.log('🔍 Fetching existing student data from database...');
    
    // Get all existing students from the database
    const existingStudents = await Student.find({}).populate('userId', 'email');
    
    console.log(`📊 Found ${existingStudents.length} existing students in database`);
    
    for (const student of existingStudents) {
      console.log('\n📝 Processing student:', {
        id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        personalInfo: student.personalInfo
      });
      
      // Update the student record to ensure proper structure
      const updatedData = {
        personalInfo: {
          name: student.name || student.personalInfo?.name || 'Unknown Name',
          regNo: student.registerNumber || student.personalInfo?.regNo || 'No Reg No',
          dateOfBirth: student.dateOfBirth || student.personalInfo?.dateOfBirth,
          gender: student.gender || student.personalInfo?.gender || 'Not Specified',
          bloodGroup: student.personalInfo?.bloodGroup,
          nationality: student.personalInfo?.nationality || 'Indian',
          religion: student.personalInfo?.religion,
          caste: student.personalInfo?.caste,
          category: student.personalInfo?.category
        },
        parentInfo: {
          fatherName: student.fatherName || student.parentInfo?.fatherName || 'Father Name',
          motherName: student.motherName || student.parentInfo?.motherName || 'Mother Name',
          fatherOccupation: student.fatherOccupation || student.parentInfo?.fatherOccupation || 'Not Specified',
          motherOccupation: student.motherOccupation || student.parentInfo?.motherOccupation || 'Not Specified',
          annualIncome: student.parentInfo?.annualIncome || 0
        },
        contactInfo: {
          mobile: student.mobile || student.contactInfo?.mobile || 'Not Provided',
          alternateMobile: student.contactInfo?.alternateMobile,
          email: student.userId?.email || 'No Email',
          address: student.address || student.contactInfo?.address || 'Address Not Provided',
          aadharNo: student.contactInfo?.aadharNo,
          abcId: student.contactInfo?.abcId
        },
        academics: {
          subjects: student.academics?.subjects || [],
          totalMarks: student.academics?.totalMarks || 0,
          averagePercentage: student.academics?.averagePercentage || 0,
          cgpa: student.academics?.cgpa || 0,
          grade: student.academics?.grade || 'Not Calculated'
        },
        attendance: student.attendance || [],
        blackmarks: student.blackmarks || [],
        profileCompleted: true,
        // Additional fields from your database
        department: student.department || 'Computer Science Engineering',
        batch: student.batch || '2023-2027',
        currentSemester: student.currentSemester || 1,
        overallAttendance: student.overallAttendance || 100,
        isActive: student.isActive !== undefined ? student.isActive : true
      };
      
      // Update the student record
      await Student.findByIdAndUpdate(student._id, updatedData, { new: true });
      
      console.log(`✅ Updated student: ${updatedData.personalInfo.name} (${updatedData.personalInfo.regNo})`);
    }
    
    console.log('\n🎉 All existing students updated successfully!');
    
    // Display summary
    const updatedStudents = await Student.find({}).populate('userId', 'email');
    console.log('\n📋 Updated Students Summary:');
    console.log('================================');
    
    updatedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId?.email || 'No Email'}`);
      console.log(`   Mobile: ${student.contactInfo.mobile}`);
      console.log(`   Department: ${student.department || 'CSE'}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log(`   Attendance: ${student.overallAttendance}%`);
      console.log('   ---');
    });
    
    console.log(`\n📊 Total students in database: ${updatedStudents.length}`);
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating existing students:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the update function
updateExistingStudents();
