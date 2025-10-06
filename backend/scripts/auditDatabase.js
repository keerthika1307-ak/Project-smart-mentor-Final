const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function auditDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 DATABASE AUDIT REPORT');
    console.log('========================');

    // Check all users
    const allUsers = await User.find().sort({ role: 1, email: 1 });
    console.log(`\n👥 TOTAL USERS: ${allUsers.length}`);
    
    const usersByRole = {
      admin: allUsers.filter(u => u.role === 'admin'),
      mentor: allUsers.filter(u => u.role === 'mentor'),
      student: allUsers.filter(u => u.role === 'student')
    };

    console.log(`   - Admins: ${usersByRole.admin.length}`);
    console.log(`   - Mentors: ${usersByRole.mentor.length}`);
    console.log(`   - Students: ${usersByRole.student.length}`);

    // Show all users
    console.log('\n📋 ALL USERS IN DATABASE:');
    console.log('=========================');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Check student profiles
    const allStudentProfiles = await Student.find().populate('userId', 'email role');
    console.log(`\n👤 STUDENT PROFILES: ${allStudentProfiles.length}`);

    console.log('\n📋 ALL STUDENT PROFILES:');
    console.log('========================');
    allStudentProfiles.forEach((student, index) => {
      const userRole = student.userId?.role || 'NO USER';
      const userEmail = student.userId?.email || 'NO EMAIL';
      const hasMarks = student.academics.subjects.length > 0;
      
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   User: ${userEmail} (${userRole})`);
      console.log(`   Subjects: ${student.academics.subjects.length}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log(`   Has Marks: ${hasMarks ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Find orphaned data
    console.log('\n🔍 DATA INTEGRITY CHECK:');
    console.log('========================');

    // Student profiles without valid user accounts
    const orphanedProfiles = allStudentProfiles.filter(s => !s.userId || s.userId.role !== 'student');
    console.log(`❌ Orphaned Student Profiles: ${orphanedProfiles.length}`);
    orphanedProfiles.forEach(profile => {
      console.log(`   - ${profile.personalInfo.name} (${profile.personalInfo.regNo}) - No valid user account`);
    });

    // Student users without profiles
    const studentUsersWithoutProfiles = [];
    for (const user of usersByRole.student) {
      const hasProfile = allStudentProfiles.some(p => p.userId && p.userId._id.toString() === user._id.toString());
      if (!hasProfile) {
        studentUsersWithoutProfiles.push(user);
      }
    }
    console.log(`❌ Student Users Without Profiles: ${studentUsersWithoutProfiles.length}`);
    studentUsersWithoutProfiles.forEach(user => {
      console.log(`   - ${user.email} - No student profile`);
    });

    // Valid student data
    const validStudents = allStudentProfiles.filter(s => s.userId && s.userId.role === 'student');
    console.log(`✅ Valid Students (User + Profile): ${validStudents.length}`);

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('===================');
    if (orphanedProfiles.length > 0) {
      console.log('❌ Remove orphaned student profiles (no valid user account)');
    }
    if (studentUsersWithoutProfiles.length > 0) {
      console.log('❌ Create profiles for student users OR remove unused student accounts');
    }
    if (validStudents.length === 0) {
      console.log('❌ No valid students found! Need at least one student with both User and Student profile');
    } else {
      console.log(`✅ Found ${validStudents.length} valid student(s) - system can work with these`);
    }

    console.log('\n📊 LEGITIMATE STUDENTS FOR SYSTEM:');
    console.log('==================================');
    validStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId.email}`);
      console.log(`   Subjects: ${student.academics.subjects.length}`);
      console.log(`   Login: ${student.userId.email} / student123`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

auditDatabase();
