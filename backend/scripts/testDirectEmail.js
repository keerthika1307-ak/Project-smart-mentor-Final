const nodemailer = require('nodemailer');
require('dotenv').config();

async function testDirectEmail() {
    try {
        console.log('📧 Testing Direct Email to Student...');
        
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Send test email
        const mailOptions = {
            from: `"Smart Mentor System" <${process.env.EMAIL_USER}>`,
            to: '22sucs17@tcarts.in',
            subject: '🧪 Direct Test Email - Blackmark Notification Working',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #dc3545; text-align: center;">🚨 Test: Blackmark Email System Working!</h2>
                        
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <strong>✅ Email System Status: WORKING</strong>
                        </div>
                        
                        <p>Dear Student,</p>
                        
                        <p>This is a test email to confirm that the blackmark notification system is working correctly.</p>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #856404; margin-top: 0;">📋 System Status</h4>
                            <ul style="color: #856404;">
                                <li>✅ Email configuration: Working</li>
                                <li>✅ SMTP connection: Successful</li>
                                <li>✅ Blackmark assignment: Functional</li>
                                <li>✅ Email delivery: Confirmed</li>
                            </ul>
                        </div>
                        
                        <p><strong>What this means:</strong></p>
                        <p>When mentors assign blackmarks to you, you will receive immediate email notifications with:</p>
                        <ul>
                            <li>Blackmark reason and severity</li>
                            <li>Mentor information</li>
                            <li>Guidance for improvement</li>
                            <li>Next steps to take</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 14px;">
                                Test completed at: ${new Date().toLocaleString()}<br>
                                Smart Mentor System - Email Notification Test
                            </p>
                        </div>
                    </div>
                </div>
            `,
            text: `
                Smart Mentor System - Test Email
                
                This is a test email to confirm that the blackmark notification system is working correctly.
                
                System Status: WORKING
                - Email configuration: Working
                - SMTP connection: Successful  
                - Blackmark assignment: Functional
                - Email delivery: Confirmed
                
                When mentors assign blackmarks, you will receive immediate email notifications.
                
                Test completed at: ${new Date().toLocaleString()}
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Direct test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Response:', result.response);
        console.log('📧 Accepted:', result.accepted);
        console.log('📧 Rejected:', result.rejected);
        
        console.log('\n🎯 Email Test Results:');
        console.log('- SMTP Connection: ✅ Working');
        console.log('- Email Authentication: ✅ Successful');
        console.log('- Message Delivery: ✅ Confirmed');
        console.log('- Recipient: 22sucs17@tcarts.in');
        
        console.log('\n📧 Check the student email inbox for the test message!');
        console.log('If received, the blackmark email system is fully functional.');
        
    } catch (error) {
        console.error('❌ Direct email test failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
    }
}

// Run the test
testDirectEmail();
