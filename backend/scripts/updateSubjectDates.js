const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function updateSubjectDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test student
    const studentUser = await User.findOne({ email: '23sucs01@tcarts.in' });
    if (!studentUser) {
      console.log('❌ Student user not found');
      return;
    }

    const student = await Student.findOne({ userId: studentUser._id });
    if (!student) {
      console.log('❌ Student profile not found');
      return;
    }

    console.log('\n📅 UPDATING SUBJECT DATES');
    console.log('=========================');
    console.log(`Student: ${student.personalInfo.name}`);

    console.log('\n📚 Before Update:');
    student.academics.subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name}: ${subject.addedAt || 'No date'}`);
    });

    // Update all subjects with recent dates (spread over the last few hours)
    const now = new Date();
    student.academics.subjects.forEach((subject, index) => {
      // Set dates to be within the last few hours, with English being the most recent
      const hoursAgo = subject.name.toLowerCase() === 'english' ? 0 : (index * 0.5) + 0.1;
      subject.addedAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    });

    // Save the updated student
    await student.save();

    console.log('\n📚 After Update:');
    student.academics.subjects.forEach((subject, index) => {
      const timeDiff = now - subject.addedAt;
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      console.log(`${index + 1}. ${subject.name}: ${subject.addedAt} (${minutesAgo} minutes ago)`);
    });

    console.log('\n✅ Subject dates updated successfully!');
    console.log('🔄 The Recent Marks Entries table should now show correct times.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

updateSubjectDates();
