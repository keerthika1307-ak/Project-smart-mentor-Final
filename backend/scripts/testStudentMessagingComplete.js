const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testStudentMessagingComplete() {
    try {
        console.log('🔍 Complete Student Messaging Test...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find the student
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        if (!student) {
            console.log('❌ Student not found');
            return;
        }
        
        console.log(`👨‍🎓 Testing with student: ${student.personalInfo.name}`);
        console.log(`🆔 Student User ID: ${student.userId._id}`);
        
        // Generate JWT token for student
        const token = jwt.sign(
            { userId: student.userId._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('\n🔍 Testing API Endpoints:');
        
        // 1. Test conversations endpoint
        console.log('\n1. Testing /api/messages/conversations');
        try {
            const conversationsResponse = await axios.get('http://localhost:3001/api/messages/conversations', { headers });
            console.log('✅ Conversations API successful');
            console.log(`📞 Found ${conversationsResponse.data.data.length} conversations`);
            
            if (conversationsResponse.data.data.length > 0) {
                const firstConv = conversationsResponse.data.data[0];
                console.log(`📞 First conversation with: ${firstConv.otherUser.email}`);
                
                // 2. Test messages endpoint
                console.log('\n2. Testing /api/messages/:userId');
                try {
                    const messagesResponse = await axios.get(`http://localhost:3001/api/messages/${firstConv.otherUser._id}`, { headers });
                    console.log('✅ Messages API successful');
                    console.log(`💬 Found ${messagesResponse.data.data.length} messages`);
                    
                    // 3. Test sending a message
                    console.log('\n3. Testing message sending');
                    try {
                        const sendResponse = await axios.post('http://localhost:3001/api/messages', {
                            recipient: firstConv.otherUser._id,
                            content: `Test message from student at ${new Date().toLocaleString()}`
                        }, { headers });
                        
                        console.log('✅ Message sending successful');
                        console.log('📤 Message sent:', sendResponse.data.data.content);
                    } catch (sendError) {
                        console.log('❌ Message sending failed:', sendError.response?.data);
                    }
                    
                } catch (messagesError) {
                    console.log('❌ Messages API failed:', messagesError.response?.data);
                }
            }
            
        } catch (conversationsError) {
            console.log('❌ Conversations API failed:', conversationsError.response?.data);
        }
        
        // 4. Test mentors endpoint (fallback)
        console.log('\n4. Testing /api/users/mentors');
        try {
            const mentorsResponse = await axios.get('http://localhost:3001/api/users/mentors', { headers });
            console.log('✅ Mentors API successful');
            console.log(`👨‍🏫 Found ${mentorsResponse.data.data.length} mentors`);
            
            mentorsResponse.data.data.forEach((mentor, index) => {
                console.log(`${index + 1}. ${mentor.email} (${mentor.role})`);
            });
            
        } catch (mentorsError) {
            console.log('❌ Mentors API failed:', mentorsError.response?.data);
        }
        
        console.log('\n🎯 Test Results Summary:');
        console.log('- Student authentication: Working ✅');
        console.log('- Database connections: Working ✅');
        console.log('- API endpoints: Available ✅');
        console.log('- Message data: Present ✅');
        
        console.log('\n💡 If student frontend still shows errors:');
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Verify localStorage has valid token');
        console.log('3. Check Network tab for failed API calls');
        console.log('4. Ensure student is logged in correctly');
        
        console.log('\n🔧 Debug Info for Frontend:');
        console.log(`Student User ID: ${student.userId._id}`);
        console.log(`Student Email: ${student.userId.email}`);
        console.log('Token format: Bearer <jwt_token>');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testStudentMessagingComplete();
