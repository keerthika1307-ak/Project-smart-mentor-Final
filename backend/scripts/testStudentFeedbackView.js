const axios = require('axios');

async function testStudentFeedbackView() {
    try {
        console.log('🔍 Testing student feedback view...');
        
        // First, let's test the student dashboard endpoint
        console.log('\n1. Testing student dashboard API...');
        
        // We need to simulate a student login to get the token
        // For now, let's just test the endpoint structure
        
        const studentId = '68e0dde83673f3f441889ea3'; // The student ID we found in debug
        
        try {
            const response = await axios.get(`http://localhost:3001/api/ai/feedback/${studentId}`, {
                headers: {
                    'Authorization': 'Bearer fake-token-for-testing'
                }
            });
            console.log('✅ Feedback API accessible');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Feedback API requires authentication (expected)');
            } else {
                console.log('❌ Feedback API error:', error.response?.status, error.response?.data);
            }
        }
        
        console.log('\n📋 Expected behavior:');
        console.log('1. Student logs in as 22sucs17@tcarts.in');
        console.log('2. Dashboard API returns studentId: 68e0dde83673f3f441889ea3');
        console.log('3. Dashboard API includes aiFeedback with mentor feedback');
        console.log('4. Frontend should display mentor feedback with mentor name');
        
        console.log('\n🔧 Debug steps for frontend:');
        console.log('1. Open browser console on student feedback page');
        console.log('2. Look for "📋 Student dashboard data:" log');
        console.log('3. Check if aiFeedback field exists in the data');
        console.log('4. If not, check "📋 Feedback API response:" log');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testStudentFeedbackView();
