const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

async function checkStudentCredentials() {
    try {
        console.log('🔍 Checking Student Credentials...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find the student record
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        
        if (!student) {
            console.log('❌ Student record not found');
            return;
        }
        
        console.log(`👨‍🎓 Found student: ${student.personalInfo.name}`);
        console.log(`📧 Email: ${student.userId.email}`);
        console.log(`🆔 User ID: ${student.userId._id}`);
        console.log(`👤 Role: ${student.userId.role}`);
        
        // Check if user has a password
        if (student.userId.password) {
            console.log('🔐 Password hash exists in database');
            
            // Test common passwords
            const testPasswords = ['password', '123456', 'student', '22sucs17', 'tcarts'];
            
            for (const testPassword of testPasswords) {
                const isMatch = await bcrypt.compare(testPassword, student.userId.password);
                if (isMatch) {
                    console.log(`✅ FOUND WORKING PASSWORD: "${testPassword}"`);
                    break;
                }
            }
            
            console.log('\n🔍 If none of the above passwords work, you may need to reset the password.');
        } else {
            console.log('❌ No password set for this user');
        }
        
        // Also check for any other student users
        console.log('\n📋 All student users in database:');
        const allStudents = await Student.find().populate('userId').limit(5);
        
        allStudents.forEach((s, index) => {
            console.log(`${index + 1}. ${s.personalInfo.name} - ${s.userId.email} (${s.personalInfo.regNo})`);
        });
        
        console.log('\n💡 Login Instructions:');
        console.log('1. Use email: 22sucs17@tcarts.in');
        console.log('2. Try passwords: password, 123456, student, or 22sucs17');
        console.log('3. If none work, we may need to reset the password');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the check
checkStudentCredentials();
