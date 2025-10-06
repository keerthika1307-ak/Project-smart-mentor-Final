const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSimpleEmail() {
    try {
        console.log('📧 Testing Simple Email Configuration...');
        
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        console.log('📧 Email Config:');
        console.log('Host:', process.env.EMAIL_HOST);
        console.log('Port:', process.env.EMAIL_PORT);
        console.log('User:', process.env.EMAIL_USER);
        console.log('Pass:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
        
        // Verify transporter
        console.log('\n🔧 Verifying transporter...');
        try {
            await transporter.verify();
            console.log('✅ Transporter verified successfully');
        } catch (verifyError) {
            console.error('❌ Transporter verification failed:');
            console.error('Error:', verifyError.message);
            console.error('Code:', verifyError.code);
            return;
        }
        
        // Send test email
        console.log('\n📧 Sending test email...');
        const mailOptions = {
            from: `"Smart Mentor Test" <${process.env.EMAIL_USER}>`,
            to: '22sucs17@tcarts.in', // Test student email
            subject: '🧪 Test Email - Smart Mentor System',
            text: 'This is a test email to verify the email functionality is working correctly.',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #007bff;">🧪 Test Email</h2>
                    <p>This is a test email to verify the email functionality is working correctly.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>From:</strong> Smart Mentor System</p>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Response:', result.response);
        
        console.log('\n🎯 Email Test Results:');
        console.log('- Configuration: ✅ Valid');
        console.log('- Authentication: ✅ Working');
        console.log('- Sending: ✅ Successful');
        console.log('- Recipient: 22sucs17@tcarts.in');
        
        console.log('\n💡 If you received the test email, the email system is working correctly.');
        console.log('The issue might be in the blackmark notification integration.');
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Authentication Error Solutions:');
            console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
            console.log('2. For Gmail: Use App Password instead of regular password');
            console.log('3. Enable 2-factor authentication and generate App Password');
            console.log('4. Go to: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION') {
            console.log('\n💡 Connection Error Solutions:');
            console.log('1. Check internet connection');
            console.log('2. Verify EMAIL_HOST and EMAIL_PORT');
            console.log('3. Check firewall settings');
        }
    }
}

// Run the test
testSimpleEmail();
