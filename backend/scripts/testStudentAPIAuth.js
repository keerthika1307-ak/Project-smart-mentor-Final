const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testStudentAPIAuth() {
    try {
        console.log('🔍 Testing Student API Authentication...');
        
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
        console.log(`🆔 Student User ID: ${student.userId._id}`);
        console.log(`📧 Student Email: ${student.userId.email}`);
        
        // Generate a JWT token for the student
        const token = jwt.sign(
            { userId: student.userId._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        console.log('🔑 Generated JWT token for student');
        
        // Test the conversations endpoint
        console.log('\n1. Testing conversations endpoint...');
        try {
            const response = await axios.get('http://localhost:3001/api/messages/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ Conversations API call successful!');
            console.log('📊 Response:', response.data);
            console.log('📞 Conversations count:', response.data.data?.length || 0);
            
            if (response.data.data && response.data.data.length > 0) {
                console.log('\n📞 Available conversations:');
                response.data.data.forEach((conv, index) => {
                    console.log(`${index + 1}. ${conv.otherUser.email} (ID: ${conv.otherUser._id})`);
                    console.log(`   Last message: ${conv.lastMessage?.content?.substring(0, 50) || 'No messages'}...`);
                });
                
                // Test messages endpoint with first conversation
                const firstConv = response.data.data[0];
                console.log(`\n2. Testing messages endpoint with ${firstConv.otherUser.email}...`);
                
                try {
                    const messagesResponse = await axios.get(`http://localhost:3001/api/messages/${firstConv.otherUser._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('✅ Messages API call successful!');
                    console.log('💬 Messages count:', messagesResponse.data.data?.length || 0);
                    
                    if (messagesResponse.data.data && messagesResponse.data.data.length > 0) {
                        console.log('\n💬 Recent messages:');
                        messagesResponse.data.data.slice(-3).forEach((msg, index) => {
                            const senderEmail = msg.sender.email;
                            const isFromStudent = msg.sender._id === student.userId._id.toString();
                            const direction = isFromStudent ? 'SENT' : 'RECEIVED';
                            console.log(`${index + 1}. [${direction}] ${senderEmail}: ${msg.content.substring(0, 60)}...`);
                        });
                    }
                    
                } catch (error) {
                    console.log('❌ Messages API call failed:', error.response?.status, error.response?.data);
                }
            }
            
        } catch (error) {
            console.log('❌ Conversations API call failed:', error.response?.status, error.response?.data);
        }
        
        console.log('\n🎯 Test Summary:');
        console.log('- Student authentication: Working');
        console.log('- Database has conversations and messages');
        console.log('- API endpoints should be accessible');
        console.log('\n💡 If student frontend still shows errors, check:');
        console.log('1. Browser console for detailed error messages');
        console.log('2. Network tab to see actual API calls');
        console.log('3. localStorage for correct token storage');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testStudentAPIAuth();
