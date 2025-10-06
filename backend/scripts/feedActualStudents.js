const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Your actual student data
const actualStudentsData = [
  // First sheet data
  { name: "AILAMED NASEER N", registerNumber: "23SUT01", mobile: "8807305016" },
  { name: "AKNINRAJ R", registerNumber: "23SUT02", mobile: "7200004946" },
  { name: "ARJUN G", registerNumber: "23SUT03", mobile: "8838075579" },
  { name: "BALA DHARSHAN R", registerNumber: "23SUT04", mobile: "7449040664" },
  { name: "GOKUL KANNAN N G", registerNumber: "23SUT05", mobile: "9344093843" },
  { name: "GOWTHAM P", registerNumber: "23SUT06", mobile: "9080526392" },
  { name: "KARTHICK S", registerNumber: "23SUT07", mobile: "9843508002" },
  { name: "LOGESH K", registerNumber: "23SUT08", mobile: "6379810115" },
  { name: "LOGESH S", registerNumber: "23SUT09", mobile: "7558138208" },
  { name: "MOHAMED AASIM G", registerNumber: "23SUT10", mobile: "8608079978" },
  { name: "PRASAD R S", registerNumber: "23SUT12", mobile: "8903183317" },
  { name: "RAKESHKUMAR M", registerNumber: "23SUT13", mobile: "8015578663" },
  { name: "P SANDAI KUMAR", registerNumber: "23SUT14", mobile: "9360817982" },
  { name: "SARAVANAN P", registerNumber: "23SUT15", mobile: "8526610225" },
  { name: "SIVA SASTHA N B", registerNumber: "23SUT16", mobile: "9942074247" },
  { name: "SHIVAISHAAN S", registerNumber: "23SUT17", mobile: "8973686234" },
  { name: "THANGA VISHAL V", registerNumber: "23SUT18", mobile: "9790519445" },
  { name: "VARUN SIDDHARTH", registerNumber: "23SUT19", mobile: "9345763339" },
  { name: "VIGNARAJKESH V", registerNumber: "23SUT20", mobile: "8524907810" },
  { name: "YUVARAJ S", registerNumber: "23SUT21", mobile: "7092546795" },
  { name: "APARNA S", registerNumber: "23SUT22", mobile: "9176728311" },
  { name: "ABINAYA MEENAKSHI K J", registerNumber: "23SUT23", mobile: "6383408181" },
  { name: "ANUSHIYA G", registerNumber: "23SUT24", mobile: "8300356693" },
  { name: "ANITA M", registerNumber: "23SUT25", mobile: "8248208575" },
  { name: "BALAPORANI R P", registerNumber: "23SUT26", mobile: "7695863261" },
  { name: "CHANDRA M", registerNumber: "23SUT27", mobile: "9095356337" },
  { name: "DHATCHAYINI M", registerNumber: "23SUT28", mobile: "8122652678" },
  { name: "DIVYA DHARSHINI P", registerNumber: "23SUT29", mobile: "9043861200" },
  
  // Second sheet data
  { name: "GOPIKA P", registerNumber: "23SUT30", mobile: "7708665481" },
  { name: "HAMSAVANI R R", registerNumber: "23SUT31", mobile: "8760555454" },
  { name: "HARINI R M", registerNumber: "23SUT32", mobile: "7418525378" },
  { name: "HARINI P", registerNumber: "23SUT33", mobile: "9042067734" },
  { name: "INDHUMATHI M", registerNumber: "23SUT34", mobile: "7904780017" },
  { name: "JANANI G", registerNumber: "23SUT35", mobile: "9345643728" },
  { name: "JANANI K S", registerNumber: "23SUT36", mobile: "9344638521" },
  { name: "KAVITHAIATHU R", registerNumber: "23SUT37", mobile: "9786465598" },
  { name: "KAVITHA S J", registerNumber: "23SUT38", mobile: "6374044646" },
  { name: "KEERTHIKA A", registerNumber: "23SUT39", mobile: "7010097668" },
  { name: "LEFNALOSANI S D", registerNumber: "23SUT40", mobile: "8300026675" },
  { name: "MEENAKSHI M", registerNumber: "23SUT41", mobile: "8668307010" },
  { name: "MOWHIKA BEGAM S", registerNumber: "23SUT42", mobile: "8925769210" },
  { name: "NANDHANA SHRI N D", registerNumber: "23SUT43", mobile: "8098260354" },
  { name: "NILIASHI M J", registerNumber: "23SUT44", mobile: "9597987774" },
  { name: "NITHYASRI M", registerNumber: "23SUT45", mobile: "8807634278" },
  { name: "NIVITHA F", registerNumber: "23SUT46", mobile: "6379467393" },
  { name: "PRIYADHARSHINI S", registerNumber: "23SUT47", mobile: "9524772589" },
  { name: "RAMYA B", registerNumber: "23SUT48", mobile: "9842159086" },
  { name: "REVATHI P", registerNumber: "23SUT49", mobile: "9865907250" },
  { name: "SANGEETHA M", registerNumber: "23SUT50", mobile: "7092857942" },
  { name: "SHASMITHA BANU S", registerNumber: "23SUT52", mobile: "9597120516" },
  { name: "SOWNDHARYA K K", registerNumber: "23SUT53", mobile: "8248455066" },
  { name: "SUBASHINI R K", registerNumber: "23SUT54", mobile: "9894317980" },
  { name: "SUSHMITHA N", registerNumber: "23SUT55", mobile: "7449115187" },
  { name: "VARSHA K", registerNumber: "23SUT56", mobile: "9655691769" }
];

// Remove duplicates based on registerNumber
const uniqueStudents = actualStudentsData.filter((student, index, self) => 
  index === self.findIndex(s => s.registerNumber === student.registerNumber)
);

async function feedActualStudents() {
  try {
    console.log('🌱 Starting to feed your actual student data...');
    
    // Clear existing students and student users
    console.log('🗑️ Clearing existing student data...');
    await Student.deleteMany({});
    await User.deleteMany({ role: 'student' });
    
    // Drop any problematic indexes
    try {
      await Student.collection.dropIndexes();
      console.log('🗂️ Dropped existing indexes');
    } catch (error) {
      console.log('ℹ️ No indexes to drop');
    }
    
    console.log(`👥 Creating ${uniqueStudents.length} students...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const studentData of uniqueStudents) {
      try {
        // Generate email from register number
        const email = `${studentData.registerNumber.toLowerCase()}@student.smartmentor.com`;
        
        // Create user account
        const hashedPassword = await bcrypt.hash('student123', 10);
        const user = new User({
          email: email,
          password: hashedPassword,
          role: 'student',
          isActive: true
        });
        await user.save();
        
        // Determine gender based on name patterns (basic heuristic)
        const femaleIndicators = ['APARNA', 'ABINAYA', 'ANUSHIYA', 'ANITA', 'BALAPORANI', 'CHANDRA', 'DHATCHAYINI', 'DIVYA', 'GOPIKA', 'HAMSAVANI', 'HARINI', 'INDHUMATHI', 'JANANI', 'KAVITHA', 'KEERTHIKA', 'LEFNALOSANI', 'MEENAKSHI', 'MOWHIKA', 'NANDHANA', 'NILIASHI', 'NITHYASRI', 'NIVITHA', 'PRIYADHARSHINI', 'RAMYA', 'REVATHI', 'SANGEETHA', 'SHASMITHA', 'SOWNDHARYA', 'SUBASHINI', 'SUSHMITHA', 'VARSHA'];
        const gender = femaleIndicators.some(indicator => studentData.name.includes(indicator)) ? 'Female' : 'Male';
        
        // Generate random academic data
        const subjects = [
          { name: 'Mathematics', marks: Math.floor(Math.random() * 30) + 70 },
          { name: 'Physics', marks: Math.floor(Math.random() * 30) + 70 },
          { name: 'Chemistry', marks: Math.floor(Math.random() * 30) + 70 },
          { name: 'Computer Science', marks: Math.floor(Math.random() * 30) + 70 },
          { name: 'English', marks: Math.floor(Math.random() * 30) + 70 }
        ];
        
        // Generate attendance data
        const attendanceData = [
          { 
            month: 'September', 
            year: 2024, 
            daysPresent: Math.floor(Math.random() * 5) + 20, 
            totalDays: 25, 
            percentage: 0 
          },
          { 
            month: 'August', 
            year: 2024, 
            daysPresent: Math.floor(Math.random() * 6) + 22, 
            totalDays: 28, 
            percentage: 0 
          }
        ];
        
        // Calculate attendance percentages
        attendanceData.forEach(att => {
          att.percentage = Math.round((att.daysPresent / att.totalDays) * 100);
        });
        
        // Create student profile
        const student = new Student({
          userId: user._id,
          personalInfo: {
            name: studentData.name,
            regNo: studentData.registerNumber,
            dateOfBirth: new Date('2005-01-01'), // Default DOB
            gender: gender,
            bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
            nationality: 'Indian',
            religion: gender === 'Female' && studentData.name.includes('MOWHIKA') ? 'Islam' : 'Hindu',
            caste: 'General',
            category: 'General'
          },
          parentInfo: {
            fatherName: `${studentData.name.split(' ')[0]} Father`,
            motherName: `${studentData.name.split(' ')[0]} Mother`,
            fatherOccupation: ['Engineer', 'Teacher', 'Business', 'Doctor', 'Farmer', 'Government Employee'][Math.floor(Math.random() * 6)],
            motherOccupation: ['Homemaker', 'Teacher', 'Nurse', 'Government Employee'][Math.floor(Math.random() * 4)],
            annualIncome: Math.floor(Math.random() * 500000) + 300000 // 3L to 8L
          },
          contactInfo: {
            mobile: `+91 ${studentData.mobile}`,
            alternateMobile: `+91 ${studentData.mobile.slice(0, -1)}${Math.floor(Math.random() * 10)}`,
            email: email,
            address: `Student Address, Chennai, Tamil Nadu - 60000${Math.floor(Math.random() * 9) + 1}`,
            aadharNo: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
            abcId: `ABC${studentData.registerNumber}`
          },
          academics: {
            subjects: subjects
          },
          attendance: attendanceData,
          blackmarks: [], // No blackmarks initially
          profileCompleted: true,
          department: 'Computer Science Engineering',
          batch: '2023-2027',
          currentSemester: 1,
          overallAttendance: Math.floor(Math.random() * 20) + 80, // 80-100%
          isActive: true
        });
        
        // Calculate CGPA
        student.updateAcademics();
        await student.save();
        
        successCount++;
        console.log(`✅ Created: ${studentData.name} (${studentData.registerNumber}) - ${gender}`);
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Error creating ${studentData.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Student data feeding completed!');
    console.log(`✅ Successfully created: ${successCount} students`);
    console.log(`❌ Errors: ${errorCount} students`);
    console.log(`📊 Total unique students processed: ${uniqueStudents.length}`);
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@smartmentor.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        email: 'admin@smartmentor.com',
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('👑 Admin user created: admin@smartmentor.com / admin123');
    }
    
    // Display sample of created students
    const sampleStudents = await Student.find({}).populate('userId', 'email').limit(10);
    console.log('\n📋 Sample of Created Students:');
    console.log('================================');
    
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.personalInfo.name} (${student.personalInfo.regNo})`);
      console.log(`   Email: ${student.userId?.email}`);
      console.log(`   Mobile: ${student.contactInfo.mobile}`);
      console.log(`   Gender: ${student.personalInfo.gender}`);
      console.log(`   CGPA: ${student.academics.cgpa}`);
      console.log(`   Attendance: ${student.overallAttendance}%`);
      console.log('   ---');
    });
    
    const totalCount = await Student.countDocuments();
    console.log(`\n📊 Total students in database: ${totalCount}`);
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error feeding student data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the feeding function
feedActualStudents();
