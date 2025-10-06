const axios = require('axios');

async function testStudentLogin() {
    try {
        console.log('🔍 Testing Student Login...');
        
        const loginData = {
            email: '22sucs17@tcarts.in',
            password: 'student123'
        };
        
        console.log('📧 Email:', loginData.email);
        console.log('🔐 Password:', loginData.password);
        
        // Test login
        const response = await axios.post('http://localhost:3001/api/auth/login', loginData);
        
        if (response.data.success) {
            console.log('✅ Login successful!');
            console.log('🔑 Token received:', response.data.token.substring(0, 50) + '...');
            console.log('👤 User data:', response.data.user);
            
            // Test token with a protected endpoint
            console.log('\n🧪 Testing token with dashboard endpoint...');
            const dashboardResponse = await axios.get('http://localhost:3001/api/students/dashboard', {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`
                }
            });
            
            if (dashboardResponse.data.success) {
                console.log('✅ Token works! Dashboard data received');
                console.log('📊 Student data:', dashboardResponse.data.data.personalInfo.name);
            } else {
                console.log('❌ Token test failed');
            }
            
        } else {
            console.log('❌ Login failed:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error.response?.data || error.message);
    }
}

// Run the test
testStudentLogin();
