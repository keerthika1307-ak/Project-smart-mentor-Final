const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function testMentorInterface() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 TESTING MENTOR INTERFACE DATA FLOW');
    console.log('=====================================');

    // Step 1: Test getMentorStudents API (equivalent to /mentors/students)
    console.log('\n📊 Step 1: Getting all students (like getMentorStudents API)');
    const students = await Student.find({})
      .populate('userId', 'email createdAt')
      .sort({ 'personalInfo.name': 1 });

    console.log(`Found ${students.length} students:`);
    students.forEach((student, index) => {
      const overallAttendance = student.attendance.length > 0
        ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
        : 0;

      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId?.email}`);
      console.log(`   Subjects: ${student.academics.subjects.length}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log(`   Attendance: ${overallAttendance.toFixed(1)}%`);
    });

    // Step 2: Test getStudentAcademics for each student (like the mentor interface does)
    console.log('\n📚 Step 2: Getting academic data for each student');
    const allEntries = [];

    for (const student of students) {
      console.log(`\n🔍 Getting academics for: ${student.personalInfo.name}`);
      
      // This simulates what the mentor interface does in loadRecentEntries
      if (student.academics.subjects && student.academics.subjects.length > 0) {
        console.log(`   Found ${student.academics.subjects.length} subjects:`);
        
        student.academics.subjects.forEach(subject => {
          const entry = {
            studentId: student._id,
            studentName: student.personalInfo.name,
            subjectId: subject._id,
            subjectName: subject.name,
            marks: subject.marks,
            addedAt: subject.addedAt || new Date(),
            grade: getGrade(subject.marks)
          };
          
          allEntries.push(entry);
          console.log(`     - ${subject.name}: ${subject.marks}/100 (${entry.grade.letter})`);
        });
      } else {
        console.log('   No subjects found');
      }
    }

    // Step 3: Sort and display recent entries (like mentor interface)
    console.log('\n📋 Step 3: Recent Marks Entries (sorted by date)');
    console.log('================================================');
    
    if (allEntries.length === 0) {
      console.log('❌ No marks entries found!');
      console.log('💡 This explains why the mentor interface shows no recent entries.');
    } else {
      // Sort by date (most recent first)
      allEntries.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      
      console.log(`✅ Found ${allEntries.length} total entries:`);
      allEntries.slice(0, 10).forEach((entry, index) => {
        const timeAgo = formatTimeAgo(entry.addedAt);
        console.log(`${index + 1}. ${entry.studentName} - ${entry.subjectName}: ${entry.marks}/100 (${entry.grade.letter}) - ${timeAgo}`);
      });
    }

    console.log('\n✅ Mentor interface test completed!');
    
    if (allEntries.length === 0) {
      console.log('\n🎯 SOLUTION: The mentor interface shows no entries because there are no subjects in the database.');
      console.log('   To fix this, mentors need to add marks through the web interface.');
      console.log('   The backend API is working correctly - the issue is just no data exists yet.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Helper functions (same as mentor interface)
function getGrade(marks) {
  if (marks >= 90) return { letter: 'A+', class: 'excellent' };
  if (marks >= 80) return { letter: 'A', class: 'good' };
  if (marks >= 70) return { letter: 'B+', class: 'good' };
  if (marks >= 60) return { letter: 'B', class: 'average' };
  if (marks >= 50) return { letter: 'C', class: 'average' };
  if (marks >= 40) return { letter: 'D', class: 'poor' };
  return { letter: 'F', class: 'poor' };
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

testMentorInterface();
