const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function testStudentDashboard() {
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

        console.log(`📋 Testing dashboard for: ${student.personalInfo.name} (${student.personalInfo.regNo})`);
        console.log(`🆔 Student ID: ${student._id}`);

        // Simulate the dashboard response
        const latestAttendance = student.attendance.length > 0 
            ? student.attendance[student.attendance.length - 1] 
            : null;

        const overallAttendance = student.attendance.length > 0
            ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
            : 0;

        const dashboardData = {
            studentId: student._id,
            personalInfo: student.personalInfo,
            academics: {
                subjects: student.academics.subjects,
                totalMarks: student.academics.totalMarks,
                averagePercentage: student.academics.averagePercentage,
                cgpa: student.academics.cgpa,
                subjectCount: student.academics.subjects.length
            },
            attendance: {
                latest: latestAttendance,
                overall: Math.round(overallAttendance * 100) / 100,
                history: student.attendance.slice(-6)
            },
            aiFeedback: student.aiFeedback
        };

        console.log('\n📊 Dashboard Data Structure:');
        console.log('Student ID:', dashboardData.studentId);
        console.log('CGPA:', dashboardData.academics.cgpa);
        console.log('Overall Attendance:', dashboardData.attendance.overall + '%');
        console.log('AI Feedback Available:', !!dashboardData.aiFeedback?.lastFeedback);

        if (dashboardData.aiFeedback?.lastFeedback) {
            console.log('Feedback Type:', dashboardData.aiFeedback.feedbackType);
            console.log('Last Updated:', dashboardData.aiFeedback.lastUpdated);
            console.log('Feedback Preview:', dashboardData.aiFeedback.lastFeedback.substring(0, 100) + '...');
        }

        console.log('\n✅ Dashboard test completed successfully!');
        console.log('🔗 Frontend can now access feedback using studentId:', dashboardData.studentId);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testStudentDashboard();
