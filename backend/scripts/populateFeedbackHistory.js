const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function populateFeedbackHistory() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the student
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        if (!student) {
            console.log('❌ Student not found');
            return;
        }

        console.log(`📋 Adding feedback history for: ${student.personalInfo.name} (${student.personalInfo.regNo})`);

        // Clear existing feedback history for testing
        student.feedbackHistory = [];

        // Add multiple feedback entries
        const feedbackEntries = [
            {
                feedback: "Excellent work, nithesh! Your CGPA of 9 demonstrates outstanding academic performance. Continue to challenge yourself with advanced topics and consider mentoring peers who might benefit from your expertise.",
                feedbackType: 'academic',
                createdAt: new Date('2025-10-04T13:18:23.581Z'),
                mentorId: new mongoose.Types.ObjectId(),
                mentorName: 'Prof. Johnson',
                mentorEmail: 'johnson@smartmentor.com'
            },
            {
                feedback: "Your attendance has been consistently good at 97%. This shows great commitment to your studies. Keep maintaining this excellent attendance record as it reflects your dedication to learning.",
                feedbackType: 'attendance',
                createdAt: new Date('2025-10-03T10:30:00.000Z'),
                mentorId: new mongoose.Types.ObjectId(),
                mentorName: 'Dr. Smith',
                mentorEmail: 'smith@smartmentor.com'
            },
            {
                feedback: "I've noticed significant improvement in your participation during class discussions. Your analytical thinking and problem-solving approach have impressed me. Continue this positive momentum!",
                feedbackType: 'behavior',
                createdAt: new Date('2025-10-02T15:45:00.000Z'),
                mentorId: new mongoose.Types.ObjectId(),
                mentorName: 'Prof. Johnson',
                mentorEmail: 'johnson@smartmentor.com'
            },
            {
                feedback: "Overall assessment: You are performing exceptionally well across all areas. Your academic excellence, consistent attendance, and positive behavior make you a role model for other students. Keep up the outstanding work!",
                feedbackType: 'overall',
                createdAt: new Date('2025-10-01T09:15:00.000Z'),
                mentorId: new mongoose.Types.ObjectId(),
                mentorName: 'Head of Department',
                mentorEmail: 'hod@smartmentor.com'
            }
        ];

        // Add all feedback entries
        student.feedbackHistory.push(...feedbackEntries);

        // Update the latest feedback for backward compatibility
        const latestFeedback = feedbackEntries[0];
        student.aiFeedback = {
            lastFeedback: latestFeedback.feedback,
            lastUpdated: latestFeedback.createdAt,
            feedbackType: latestFeedback.feedbackType,
            generatedBy: latestFeedback.mentorId.toString(),
            mentorName: latestFeedback.mentorName,
            mentorEmail: latestFeedback.mentorEmail
        };

        await student.save();
        
        console.log('✅ Feedback history populated successfully!');
        console.log(`📊 Total feedback entries: ${student.feedbackHistory.length}`);
        
        // Display the feedback history
        console.log('\n📝 Feedback History:');
        student.feedbackHistory.forEach((feedback, index) => {
            console.log(`${index + 1}. [${feedback.feedbackType}] by ${feedback.mentorName} on ${feedback.createdAt.toDateString()}`);
            console.log(`   "${feedback.feedback.substring(0, 80)}..."`);
        });

        console.log('\n🎯 Now both mentor and student can see complete feedback history!');

    } catch (error) {
        console.error('❌ Failed to populate feedback history:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
populateFeedbackHistory();
