const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function addTestSubjects() {
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

    console.log('\n📚 Current Subjects Before Adding:');
    student.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks} marks`);
    });

    // Add Tamil subject
    console.log('\n➕ Adding Tamil subject...');
    const tamilExists = student.academics.subjects.findIndex(
      subject => subject.name.toLowerCase() === 'tamil'
    );

    if (tamilExists === -1) {
      student.academics.subjects.push({
        name: 'Tamil',
        marks: 88
      });
      console.log('   ✅ Tamil added with 88 marks');
    } else {
      student.academics.subjects[tamilExists].marks = 88;
      console.log('   ✅ Tamil updated with 88 marks');
    }

    // Add Topology subject
    console.log('\n➕ Adding Topology subject...');
    const topologyExists = student.academics.subjects.findIndex(
      subject => subject.name.toLowerCase() === 'topology'
    );

    if (topologyExists === -1) {
      student.academics.subjects.push({
        name: 'Topology',
        marks: 91
      });
      console.log('   ✅ Topology added with 91 marks');
    } else {
      student.academics.subjects[topologyExists].marks = 91;
      console.log('   ✅ Topology updated with 91 marks');
    }

    // Update academic calculations
    console.log('\n🔄 Updating academic calculations...');
    student.updateAcademics();
    await student.save();
    console.log('   ✅ Student data saved');

    console.log('\n📚 Subjects After Adding:');
    student.academics.subjects.forEach(subject => {
      console.log(`   ${subject.name}: ${subject.marks} marks`);
    });

    console.log('\n📈 Updated Academic Summary:');
    console.log(`   CGPA: ${student.academics.cgpa}`);
    console.log(`   Average Percentage: ${student.academics.averagePercentage?.toFixed(2)}%`);
    console.log(`   Total Marks: ${student.academics.totalMarks}`);
    console.log(`   Subject Count: ${student.academics.subjects.length}`);

    console.log('\n✅ Test subjects added successfully!');
    console.log('\n💡 Now check the student academics page to see if Tamil and Topology appear');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

addTestSubjects();
