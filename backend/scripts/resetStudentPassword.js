const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

async function resetStudentPassword() {
    try {
        console.log('🔧 Resetting Student Password...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find the student
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        
        if (!student) {
            console.log('❌ Student not found');
            return;
        }
        
        console.log(`👨‍🎓 Found student: ${student.personalInfo.name}`);
        console.log(`📧 Email: ${student.userId.email}`);
        
        // Set new password
        const newPassword = 'student123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update the user's password
        await User.findByIdAndUpdate(student.userId._id, {
            password: hashedPassword
        });
        
        console.log('✅ Password updated successfully!');
        console.log('\n🔑 New Login Credentials:');
        console.log(`📧 Email: ${student.userId.email}`);
        console.log(`🔐 Password: ${newPassword}`);
        
        // Test the new password
        console.log('\n🧪 Testing new password...');
        const updatedUser = await User.findById(student.userId._id);
        const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
        
        if (isMatch) {
            console.log('✅ Password test successful!');
        } else {
            console.log('❌ Password test failed');
        }
        
        console.log('\n📱 You can now login with:');
        console.log(`Email: 22sucs17@tcarts.in`);
        console.log(`Password: student123`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the reset
resetStudentPassword();
