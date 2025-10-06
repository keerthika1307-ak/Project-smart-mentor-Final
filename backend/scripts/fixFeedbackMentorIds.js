const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

async function fixFeedbackMentorIds() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the real mentor user
        const mentor = await User.findOne({ role: 'mentor' });
        if (!mentor) {
            console.log('❌ No mentor user found');
            return;
        }

        console.log(`👨‍🏫 Found mentor: ${mentor.email} (ID: ${mentor._id})`);

        // Find the student
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' });
        if (!student) {
            console.log('❌ Student not found');
            return;
        }

        console.log(`📋 Found student: ${student.personalInfo.name} (${student.personalInfo.regNo})`);
        console.log(`📊 Current feedback history count: ${student.feedbackHistory.length}`);

        // Update all feedback entries to use the real mentor ID
        student.feedbackHistory.forEach((feedback, index) => {
            console.log(`Updating feedback ${index + 1}: ${feedback.feedbackType} by ${feedback.mentorName}`);
            feedback.mentorId = mentor._id;
        });

        // Also update the aiFeedback field
        if (student.aiFeedback) {
            student.aiFeedback.generatedBy = mentor._id.toString();
        }

        await student.save();
        
        console.log('✅ Updated all feedback entries with real mentor ID');

        // Verify the update
        const updatedStudent = await Student.findById(student._id);
        console.log('\n📊 Verification:');
        console.log(`Feedback history count: ${updatedStudent.feedbackHistory.length}`);
        updatedStudent.feedbackHistory.forEach((feedback, index) => {
            console.log(`${index + 1}. Mentor ID: ${feedback.mentorId} (should match ${mentor._id})`);
        });

        console.log('\n🎯 Now the mentor should be able to see their feedback history!');

    } catch (error) {
        console.error('❌ Failed to fix mentor IDs:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
fixFeedbackMentorIds();
