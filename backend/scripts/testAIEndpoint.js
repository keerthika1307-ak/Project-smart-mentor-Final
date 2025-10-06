const axios = require('axios');

async function testAIEndpoint() {
    try {
        console.log('🔍 Testing AI endpoints...');
        
        // Test the health endpoint first
        try {
            const healthResponse = await axios.get('http://localhost:3001/api/health');
            console.log('✅ Health endpoint working:', healthResponse.data);
        } catch (error) {
            console.log('❌ Health endpoint failed:', error.message);
            return;
        }
        
        // Test the AI test endpoint (without auth)
        try {
            const testResponse = await axios.get('http://localhost:3001/api/ai/test');
            console.log('✅ AI test endpoint working:', testResponse.data);
        } catch (error) {
            console.log('❌ AI test endpoint failed:', error.response?.status, error.response?.data || error.message);
        }
        
        // Test a student ID that exists (from our previous tests)
        const testStudentId = '67002c78e8e5b5c4e8e5b5c4'; // This might not exist, but we'll see the error
        
        try {
            const feedbackResponse = await axios.get(`http://localhost:3001/api/ai/feedback/${testStudentId}`);
            console.log('✅ AI feedback endpoint working:', feedbackResponse.data);
        } catch (error) {
            console.log('❌ AI feedback endpoint failed:', error.response?.status, error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAIEndpoint();
