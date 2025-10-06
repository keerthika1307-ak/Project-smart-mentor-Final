const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

async function debugStudentLogin() {
    try {
        console.log('🔍 Debugging Student Login Issue...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const email = '22sucs17@tcarts.in';
        const password = 'student123';
        
        console.log(`\n🔍 Testing login for: ${email}`);
        console.log(`🔐 Password: ${password}`);
        
        // Step 1: Find user
        console.log('\n1. Finding user in database...');
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ User not found in database');
            
            // Check if student exists
            const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
            if (student) {
                console.log('📋 Student record exists but user email might be different:');
                console.log(`   Student email: ${student.userId.email}`);
                console.log(`   Looking for: ${email}`);
            }
            return;
        }
        
        console.log('✅ User found in database');
        console.log(`   User ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Is Active: ${user.isActive}`);
        console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
        
        // Step 2: Check if user is active
        console.log('\n2. Checking user status...');
        if (!user.isActive) {
            console.log('❌ User account is deactivated');
            
            // Activate the user
            console.log('🔧 Activating user account...');
            await User.findByIdAndUpdate(user._id, { isActive: true });
            console.log('✅ User account activated');
        } else {
            console.log('✅ User account is active');
        }
        
        // Step 3: Test password comparison
        console.log('\n3. Testing password comparison...');
        
        // Test with bcrypt directly
        const directMatch = await bcrypt.compare(password, user.password);
        console.log(`   Direct bcrypt.compare: ${directMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        // Test with user method
        const methodMatch = await user.comparePassword(password);
        console.log(`   User.comparePassword: ${methodMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (!directMatch && !methodMatch) {
            console.log('\n🔧 Password doesn\'t match. Resetting password...');
            
            // Reset password manually
            const saltRounds = 12; // Match the User model
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            await User.findByIdAndUpdate(user._id, { 
                password: hashedPassword,
                isActive: true 
            });
            
            console.log('✅ Password reset completed');
            
            // Test again
            const updatedUser = await User.findById(user._id).select('+password');
            const newMatch = await bcrypt.compare(password, updatedUser.password);
            console.log(`   New password test: ${newMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        }
        
        // Step 4: Test full login flow
        console.log('\n4. Testing complete login flow...');
        
        const axios = require('axios');
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                email: email,
                password: password
            });
            
            if (response.data.success) {
                console.log('✅ LOGIN SUCCESSFUL!');
                console.log(`   Token: ${response.data.data.token.substring(0, 50)}...`);
                console.log(`   User: ${JSON.stringify(response.data.data.user, null, 2)}`);
            } else {
                console.log('❌ Login failed:', response.data.message);
            }
        } catch (error) {
            console.log('❌ Login API call failed:', error.response?.data || error.message);
        }
        
        console.log('\n🎯 Summary:');
        console.log(`- User exists: ${!!user}`);
        console.log(`- User active: ${user?.isActive}`);
        console.log(`- Password match: ${directMatch || methodMatch}`);
        console.log('\n📱 Try logging in with:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the debug
debugStudentLogin();
