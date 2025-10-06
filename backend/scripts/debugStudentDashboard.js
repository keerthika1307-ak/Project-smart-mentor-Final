const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function debugStudentDashboard() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the student user account
        const user = await User.findOne({ email: '22sucs17@tcarts.in' });
        if (!user) {
            console.log('❌ User with email 22sucs17@tcarts.in not found');
            
            // Let's see what users exist
            const allUsers = await User.find({ role: 'student' }, 'email');
            console.log('\n📋 Available student users:');
            allUsers.forEach(u => {
                console.log(`- ${u.email}`);
            });
            return;
        }

        console.log(`\n👤 Found user: ${user.email}`);
        console.log(`🆔 User ID: ${user._id}`);

        // Find the corresponding student record
        const student = await Student.findOne({ userId: user._id }).populate('userId');
        if (!student) {
            console.log('❌ No student record found for this user');
            return;
        }

        console.log(`\n📋 Found student record: ${student.personalInfo.name} (${student.personalInfo.regNo})`);
        console.log(`🆔 Student ID: ${student._id}`);

        // Simulate the dashboard API response
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
            blackmarks: {
                total: student.blackmarks.length,
                recent: student.blackmarks.slice(-5),
                highSeverity: student.blackmarks.filter(b => b.severity === 'High').length
            },
            aiFeedback: student.aiFeedback,
            profileCompleted: student.profileCompleted
        };

        console.log('\n📊 Dashboard API would return:');
        console.log('Student ID:', dashboardData.studentId.toString());
        console.log('Has aiFeedback:', !!dashboardData.aiFeedback?.lastFeedback);
        
        if (dashboardData.aiFeedback?.lastFeedback) {
            console.log('Feedback exists in dashboard response');
            console.log('Mentor Name:', dashboardData.aiFeedback.mentorName);
            console.log('Feedback Type:', dashboardData.aiFeedback.feedbackType);
        }

        // Test the feedback API endpoint
        console.log('\n🔍 Testing feedback API endpoint...');
        console.log(`Would call: GET /api/ai/feedback/${student._id}`);
        
        const feedbackResponse = {
            success: true,
            data: {
                feedback: student.aiFeedback || {
                    lastFeedback: null,
                    lastUpdated: null,
                    feedbackType: null
                }
            }
        };
        
        console.log('Feedback API Response:', JSON.stringify(feedbackResponse, null, 2));

    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the debug
debugStudentDashboard();
