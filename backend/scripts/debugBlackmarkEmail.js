const mongoose = require('mongoose');
const { sendBlackmarkNotification } = require('../utils/emailService');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function debugBlackmarkEmail() {
    try {
        console.log('🔍 Debugging Blackmark Email Issue...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Check email configuration
        console.log('\n📧 Email Configuration:');
        console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
        console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
        console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
        
        // Find student and mentor
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        const mentor = await User.findOne({ role: { $in: ['mentor', 'admin'] } });
        
        if (!student || !mentor) {
            console.log('❌ Student or mentor not found');
            return;
        }
        
        console.log(`\n👨‍🎓 Student: ${student.personalInfo.name}`);
        console.log(`📧 Student Email: ${student.userId.email}`);
        console.log(`👨‍🏫 Mentor: ${mentor.email}`);
        
        // Test email sending directly
        console.log('\n📧 Testing direct email sending...');
        
        const testBlackmarkData = {
            reason: 'Test blackmark for debugging email issue',
            severity: 'Low',
            assignedDate: new Date()
        };
        
        try {
            const result = await sendBlackmarkNotification(student, testBlackmarkData, mentor);
            console.log('✅ Email sent successfully!');
            console.log('📧 Message ID:', result.messageId);
            console.log('📧 Response:', result.response);
        } catch (emailError) {
            console.error('❌ Email sending failed:');
            console.error('Error message:', emailError.message);
            console.error('Error code:', emailError.code);
            console.error('Error command:', emailError.command);
            
            if (emailError.response) {
                console.error('SMTP Response:', emailError.response);
            }
            
            // Check specific error types
            if (emailError.code === 'EAUTH') {
                console.log('\n💡 Authentication Error - Check:');
                console.log('- EMAIL_USER and EMAIL_PASS are correct');
                console.log('- Gmail: Enable "Less secure app access" or use App Password');
                console.log('- Outlook: Check account settings');
            } else if (emailError.code === 'ECONNECTION') {
                console.log('\n💡 Connection Error - Check:');
                console.log('- EMAIL_HOST and EMAIL_PORT are correct');
                console.log('- Network connectivity');
                console.log('- Firewall settings');
            } else if (emailError.code === 'EMESSAGE') {
                console.log('\n💡 Message Error - Check:');
                console.log('- Email content formatting');
                console.log('- Recipient email address');
            }
        }
        
        // Test transporter directly
        console.log('\n🔧 Testing email transporter...');
        const { transporter } = require('../utils/emailService');
        
        try {
            const verified = await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError) {
            console.error('❌ Email transporter verification failed:');
            console.error(verifyError.message);
        }
        
        // Test simple email
        console.log('\n📧 Testing simple email...');
        try {
            const simpleResult = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: student.userId.email,
                subject: 'Test Email from Smart Mentor',
                text: 'This is a test email to verify email functionality.',
                html: '<p>This is a <b>test email</b> to verify email functionality.</p>'
            });
            
            console.log('✅ Simple email sent successfully!');
            console.log('📧 Message ID:', simpleResult.messageId);
        } catch (simpleError) {
            console.error('❌ Simple email failed:', simpleError.message);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the debug
debugBlackmarkEmail();
