const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testFeedbackAPIs() {
    try {
        console.log('🔍 Testing Feedback APIs...');
        
        // Connect to database to get a real mentor user
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find a mentor user
        const mentor = await User.findOne({ role: 'mentor' });
        if (!mentor) {
            console.log('❌ No mentor user found');
            return;
        }
        
        console.log(`👨‍🏫 Found mentor: ${mentor.email}`);
        
        // Test the recent feedback endpoint without auth (should fail)
        console.log('\n1. Testing recent feedback endpoint without auth...');
        try {
            const response = await axios.get('http://localhost:3001/api/ai/recent-feedback');
            console.log('❌ Should have failed but got:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly requires authentication');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        // Test the feedback history endpoint
        console.log('\n2. Testing feedback history endpoint...');
        const studentId = '68e0dde83673f3f441889ea3'; // The student ID we know exists
        
        try {
            const response = await axios.get(`http://localhost:3001/api/ai/feedback-history/${studentId}`);
            console.log('❌ Should have failed but got:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly requires authentication');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        // Test server health
        console.log('\n3. Testing server health...');
        try {
            const healthResponse = await axios.get('http://localhost:3001/api/health');
            console.log('✅ Server is healthy:', healthResponse.data);
        } catch (error) {
            console.log('❌ Server health check failed:', error.message);
        }
        
        console.log('\n📋 Debug Information:');
        console.log('- Server should be running on port 3001');
        console.log('- Mentor interface should authenticate before calling APIs');
        console.log('- Check browser console for authentication errors');
        console.log('- Verify mentor is logged in with valid token');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testFeedbackAPIs();
