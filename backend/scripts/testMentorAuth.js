const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testMentorAuth() {
    try {
        console.log('🔍 Testing Mentor Authentication...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find a mentor user
        const mentor = await User.findOne({ role: 'mentor' });
        if (!mentor) {
            console.log('❌ No mentor user found');
            return;
        }
        
        console.log(`👨‍🏫 Found mentor: ${mentor.email}`);
        
        // Generate a JWT token for the mentor
        const token = jwt.sign(
            { userId: mentor._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        console.log('🔑 Generated JWT token for mentor');
        
        // Test the recent feedback endpoint with authentication
        console.log('\n1. Testing recent feedback endpoint with auth...');
        try {
            const response = await axios.get('http://localhost:3001/api/ai/recent-feedback', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ API call successful!');
            console.log('📊 Response:', response.data);
            console.log('📋 Feedback count:', response.data.data?.length || 0);
            
            if (response.data.data && response.data.data.length > 0) {
                console.log('\n📝 Recent feedback found:');
                response.data.data.forEach((feedback, index) => {
                    console.log(`${index + 1}. ${feedback.studentName} (${feedback.feedbackType}) - ${feedback.preview}`);
                });
            } else {
                console.log('📝 No recent feedback found for this mentor');
            }
            
        } catch (error) {
            console.log('❌ API call failed:', error.response?.status, error.response?.data);
        }
        
        // Test the feedback history endpoint
        console.log('\n2. Testing feedback history endpoint...');
        const studentId = '68e0dde83673f3f441889ea3';
        
        try {
            const response = await axios.get(`http://localhost:3001/api/ai/feedback-history/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ Feedback history API call successful!');
            console.log('📊 Student feedback count:', response.data.data?.feedbackHistory?.length || 0);
            
        } catch (error) {
            console.log('❌ Feedback history API call failed:', error.response?.status, error.response?.data);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testMentorAuth();
