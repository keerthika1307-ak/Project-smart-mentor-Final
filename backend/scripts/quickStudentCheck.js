const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');

dotenv.config();

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const students = await Student.find().populate('userId', 'email');
    console.log(`Total students: ${students.length}`);
    students.forEach((s, i) => console.log(`${i+1}. ${s.personalInfo.name} - ${s.userId?.email}`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}
quickCheck();
