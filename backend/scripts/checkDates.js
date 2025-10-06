const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function checkDates() {
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

    console.log('\n📅 SUBJECT DATES ANALYSIS');
    console.log('=========================');
    console.log(`Student: ${student.personalInfo.name}`);

    console.log('\n📚 All Subjects with Dates:');
    student.academics.subjects.forEach((subject, index) => {
      const addedAt = subject.addedAt || 'No date';
      const now = new Date();
      const diffTime = now - new Date(subject.addedAt);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${subject.name}:`);
      console.log(`   - Marks: ${subject.marks}/100`);
      console.log(`   - Added At: ${addedAt}`);
      console.log(`   - Time Ago: ${diffDays} days, ${diffHours % 24} hours, ${diffMinutes % 60} minutes`);
      console.log('');
    });

    // Find the English subject specifically
    const englishSubject = student.academics.subjects.find(s => s.name.toLowerCase() === 'english');
    if (englishSubject) {
      console.log('🔍 ENGLISH SUBJECT DETAILS:');
      console.log('===========================');
      console.log(`Added At: ${englishSubject.addedAt}`);
      console.log(`Raw Date: ${new Date(englishSubject.addedAt)}`);
      console.log(`Current Time: ${new Date()}`);
      
      const timeDiff = new Date() - new Date(englishSubject.addedAt);
      console.log(`Time Difference (ms): ${timeDiff}`);
      console.log(`Time Difference (minutes): ${Math.floor(timeDiff / (1000 * 60))}`);
    }

    console.log('\n✅ Date analysis complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkDates();
