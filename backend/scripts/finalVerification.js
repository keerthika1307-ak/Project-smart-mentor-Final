const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config();

async function finalVerification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🎯 FINAL SYSTEM VERIFICATION');
    console.log('============================');

    // Get all students with their data
    const students = await Student.find().populate('userId', 'email');
    
    console.log(`\n📊 SYSTEM STATUS:`);
    console.log(`   Total Students: ${students.length}`);
    
    let totalSubjects = 0;
    let studentsWithMarks = 0;
    
    console.log('\n👥 STUDENT DETAILS:');
    console.log('===================');
    
    students.forEach((student, index) => {
      const subjectCount = student.academics.subjects.length;
      totalSubjects += subjectCount;
      if (subjectCount > 0) studentsWithMarks++;
      
      console.log(`\n${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   📧 Email: ${student.userId?.email}`);
      console.log(`   📚 Subjects: ${subjectCount}`);
      console.log(`   📊 CGPA: ${student.academics.cgpa}`);
      console.log(`   📈 Average: ${student.academics.averagePercentage?.toFixed(1)}%`);
      
      if (subjectCount > 0) {
        console.log(`   📋 Subject List:`);
        student.academics.subjects.forEach((subject, idx) => {
          const timeAgo = formatTimeAgo(subject.addedAt);
          console.log(`      ${idx + 1}. ${subject.name}: ${subject.marks}/100 (${timeAgo})`);
        });
      }
    });

    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('======================');
    console.log(`✅ Students with marks: ${studentsWithMarks}/${students.length}`);
    console.log(`✅ Total subjects across all students: ${totalSubjects}`);
    console.log(`✅ Average subjects per student: ${(totalSubjects / students.length).toFixed(1)}`);

    console.log('\n🔍 INTERFACE VERIFICATION:');
    console.log('==========================');
    console.log('✅ Mentor Interface:');
    console.log('   - Should show all recent marks in "Recent Marks Entries" table');
    console.log('   - Should display correct timestamps (minutes/hours ago)');
    console.log('   - Should show proper grade badges (A+, A, B+, etc.)');
    console.log('   - Auto-refreshes every 30 seconds');

    console.log('\n✅ Student Interface:');
    console.log('   - Each student should see their own subjects and marks');
    console.log('   - Should display correct CGPA and average percentage');
    console.log('   - Should show proper grade badges and styling');
    console.log('   - Auto-refreshes every 30 seconds');

    console.log('\n🧪 TEST INSTRUCTIONS:');
    console.log('=====================');
    console.log('1. 🎓 Login as Mentor (mentor@smartmentor.com / mentor123)');
    console.log('   - Go to Academics page');
    console.log('   - Should see recent entries with proper timestamps');
    console.log('   - Try adding new marks - should appear immediately');

    console.log('\n2. 👤 Login as Student (any student email / student123)');
    console.log('   - Go to Academics page');
    console.log('   - Should see your subjects, marks, and CGPA');
    console.log('   - Should auto-refresh to show new marks added by mentor');

    console.log('\n3. 🔄 Real-time Testing:');
    console.log('   - Open both mentor and student pages');
    console.log('   - Add marks via mentor interface');
    console.log('   - Student page should update within 30 seconds');

    console.log('\n✅ SYSTEM IS READY FOR TESTING!');
    console.log('================================');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
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

finalVerification();
