const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function importRealStudents() {
  try {
    console.log('🔍 Connecting to MongoDB to import your real student data...');
    
    // First, clear all existing seeded data
    console.log('🗑️ Removing previously seeded student data...');
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    console.log('✅ Cleared existing student data');
    
    // Connect to the raw MongoDB collection
    const db = mongoose.connection.db;
    
    // Try different possible collection names for students
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    let studentsCollection;
    let rawStudents = [];
    
    // Try to find students in different collection names
    const possibleCollectionNames = ['students', 'student', 'Students', 'Student'];
    
    for (const collectionName of possibleCollectionNames) {
      try {
        studentsCollection = db.collection(collectionName);
        rawStudents = await studentsCollection.find({}).toArray();
        if (rawStudents.length > 0) {
          console.log(`📊 Found ${rawStudents.length} students in '${collectionName}' collection`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Collection '${collectionName}' not found or empty`);
      }
    }
    
    if (rawStudents.length === 0) {
      console.log('❌ No students found in any collection. Please check your database structure.');
      console.log('Available collections:', collections.map(c => c.name));
      return;
    }
    
    console.log('\n🔍 Sample student data structure:');
    console.log(JSON.stringify(rawStudents[0], null, 2));
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each student from your database
    for (let i = 0; i < rawStudents.length; i++) {
      const rawStudent = rawStudents[i];
      
      try {
        console.log(`\n📝 Processing student ${i + 1}/${rawStudents.length}:`);
        
        // Extract student information from your database structure
        const studentName = rawStudent.name || rawStudent.studentName || rawStudent.fullName || `Student ${i + 1}`;
        const registerNumber = rawStudent.registerNumber || rawStudent.regNo || rawStudent.registrationNumber || rawStudent.rollNumber || `REG${String(i + 1).padStart(3, '0')}`;
        const email = rawStudent.email || `${registerNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.smartmentor.com`;
        
        console.log(`   Name: ${studentName}`);
        console.log(`   Reg No: ${registerNumber}`);
        console.log(`   Email: ${email}`);
        
        // Create user account
        const hashedPassword = await bcrypt.hash('student123', 10);
        const user = new User({
          email: email,
          password: hashedPassword,
          role: 'student',
          isActive: true
        });
        await user.save();
        
        // Create student profile with comprehensive data mapping
        const student = new Student({
          userId: user._id,
          personalInfo: {
            name: studentName,
            regNo: registerNumber,
            dateOfBirth: rawStudent.dateOfBirth || rawStudent.dob || new Date('2005-01-01'),
            gender: rawStudent.gender || rawStudent.sex || 'Not Specified',
            bloodGroup: rawStudent.bloodGroup || rawStudent.blood_group,
            nationality: rawStudent.nationality || 'Indian',
            religion: rawStudent.religion,
            caste: rawStudent.caste,
            category: rawStudent.category || 'General'
          },
          parentInfo: {
            fatherName: rawStudent.fatherName || rawStudent.father_name || rawStudent.parentInfo?.fatherName || 'Father Name',
            motherName: rawStudent.motherName || rawStudent.mother_name || rawStudent.parentInfo?.motherName || 'Mother Name',
            fatherOccupation: rawStudent.fatherOccupation || rawStudent.father_occupation || 'Not Specified',
            motherOccupation: rawStudent.motherOccupation || rawStudent.mother_occupation || 'Not Specified',
            annualIncome: rawStudent.annualIncome || rawStudent.family_income || 500000
          },
          contactInfo: {
            mobile: rawStudent.mobile || rawStudent.phone || rawStudent.phoneNumber || '+91 9876543210',
            alternateMobile: rawStudent.alternateMobile || rawStudent.alternate_phone,
            email: email,
            address: rawStudent.address || rawStudent.fullAddress || 'Address Not Provided',
            aadharNo: rawStudent.aadharNo || rawStudent.aadhar_number,
            abcId: rawStudent.abcId || rawStudent.abc_id
          },
          academics: {
            subjects: rawStudent.subjects || [],
            totalMarks: rawStudent.totalMarks || 0,
            averagePercentage: rawStudent.averagePercentage || rawStudent.average || 0,
            cgpa: rawStudent.cgpa || rawStudent.gpa || 0,
            grade: rawStudent.grade || 'Not Calculated'
          },
          attendance: rawStudent.attendance || [],
          blackmarks: rawStudent.blackmarks || [],
          profileCompleted: true,
          department: rawStudent.department || rawStudent.branch || rawStudent.course || 'Computer Science Engineering',
          batch: rawStudent.batch || rawStudent.year || rawStudent.academicYear || '2023-2027',
          currentSemester: rawStudent.currentSemester || rawStudent.semester || 1,
          overallAttendance: rawStudent.overallAttendance || rawStudent.attendance_percentage || Math.floor(Math.random() * 20) + 80, // Random 80-100%
          isActive: rawStudent.isActive !== undefined ? rawStudent.isActive : true
        });
        
        // Add some sample subjects if none exist
        if (!student.academics.subjects || student.academics.subjects.length === 0) {
          const sampleSubjects = [
            { name: 'Mathematics', marks: Math.floor(Math.random() * 30) + 70 },
            { name: 'Physics', marks: Math.floor(Math.random() * 30) + 70 },
            { name: 'Chemistry', marks: Math.floor(Math.random() * 30) + 70 },
            { name: 'Computer Science', marks: Math.floor(Math.random() * 30) + 70 }
          ];
          student.academics.subjects = sampleSubjects;
        }
        
        // Calculate CGPA
        student.updateAcademics();
        await student.save();
        
        successCount++;
        console.log(`   ✅ Successfully created: ${studentName} (${registerNumber})`);
        
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Error processing student ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${successCount} students`);
    console.log(`❌ Errors: ${errorCount} students`);
    
    // Display final summary
    const finalStudents = await Student.find({}).populate('userId', 'email').limit(10);
    console.log('\n📋 Sample of Imported Students:');
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
    
    const totalCount = await Student.countDocuments();
    console.log(`\n📊 Total students in database: ${totalCount}`);
    
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
importRealStudents();
