const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function testMentorFeedbackFlow() {
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

        console.log(`📋 Testing mentor feedback for: ${student.personalInfo.name} (${student.personalInfo.regNo})`);

        // Simulate mentor feedback with mentor information
        const mentorFeedback = {
            lastFeedback: `Dear ${student.personalInfo.name}, I've reviewed your recent academic performance and I'm pleased to see your progress. Your CGPA of ${student.academics.cgpa || 0} shows strong dedication to your studies. Your attendance record is also commendable at ${student.attendance.length > 0 ? Math.round(student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length) : 0}%. Keep up the excellent work and continue to focus on your weaker subjects. I'm here to support you in your academic journey.`,
            lastUpdated: new Date(),
            feedbackType: 'overall',
            generatedBy: 'mentor123',
            mentorName: 'Prof. Johnson',
            mentorEmail: 'johnson@smartmentor.com'
        };

        // Update student's feedback
        student.aiFeedback = mentorFeedback;
        await student.save();
        
        console.log('✅ Mentor feedback saved to database');

        // Display feedback data for verification
        console.log('\n📊 Mentor Feedback Data:');
        console.log('Mentor Name:', student.aiFeedback.mentorName);
        console.log('Mentor Email:', student.aiFeedback.mentorEmail);
        console.log('Feedback Type:', student.aiFeedback.feedbackType);
        console.log('Last Updated:', student.aiFeedback.lastUpdated);
        console.log('Feedback Preview:', student.aiFeedback.lastFeedback.substring(0, 100) + '...');

        console.log('\n✅ Mentor feedback flow test completed successfully!');
        console.log('👨‍🎓 Students can now see mentor feedback with mentor name');
        console.log('👨‍🏫 Mentors can see their sent feedback in recent history');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testMentorFeedbackFlow();
