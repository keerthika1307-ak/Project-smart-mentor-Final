const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendAttendanceNotification } = require('../utils/emailService');
require('dotenv').config();

async function testAttendanceFlow() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a test student
        const student = await Student.findOne().populate('userId');
        if (!student) {
            console.log('❌ No students found in database');
            return;
        }

        console.log(`📋 Testing attendance for: ${student.personalInfo.name} (${student.personalInfo.regNo})`);

        // Add test attendance record
        const testAttendance = {
            month: 'October',
            year: 2024,
            daysPresent: 22,
            totalDays: 25,
            percentage: 88,
            addedAt: new Date()
        };

        // Check if attendance for this month already exists
        const existingIndex = student.attendance.findIndex(
            att => att.month === testAttendance.month && att.year === testAttendance.year
        );

        if (existingIndex !== -1) {
            student.attendance[existingIndex] = testAttendance;
            console.log('📝 Updated existing attendance record');
        } else {
            student.attendance.push(testAttendance);
            console.log('📝 Added new attendance record');
        }

        await student.save();
        console.log('✅ Attendance saved to database');

        // Test email notification
        console.log('📧 Testing email notification...');
        try {
            await sendAttendanceNotification(student, testAttendance);
            console.log('✅ Email notification sent successfully');
        } catch (emailError) {
            console.log('❌ Email notification failed:', emailError.message);
        }

        // Display current attendance data
        console.log('\n📊 Current Attendance Data:');
        console.log('Overall Records:', student.attendance.length);
        
        if (student.attendance.length > 0) {
            const overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
            console.log('Overall Percentage:', Math.round(overallAttendance * 100) / 100 + '%');
            
            console.log('\nRecent Records:');
            student.attendance.slice(-3).forEach(att => {
                console.log(`- ${att.month} ${att.year}: ${att.percentage}% (${att.daysPresent}/${att.totalDays})`);
            });
        }

        console.log('\n✅ Attendance flow test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testAttendanceFlow();
