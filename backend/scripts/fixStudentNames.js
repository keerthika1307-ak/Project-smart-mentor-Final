const mongoose = require('mongoose');
const Student = require('../models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Student name corrections based on your actual login credentials
const nameCorrections = {
  '22sucs17': 'NITHESH',      // nithesh@gmail.com
  '22SUCS17': 'NITHESH',
  '22sucs01': 'AATHI',        // aathi@gmail.com  
  '22SUCS01': 'AATHI',
  '22sucs05': 'DEPAK',        // depak@gmail.com
  '22SUCS05': 'DEPAK', 
  '22sucs14': 'MOHAN',        // mohan@gmail.com
  '22SUCS14': 'MOHAN',
  '22sucs03': 'DEEPAK KUMAR', // keeping existing if no login provided
  '22SUCS03': 'DEEPAK KUMAR',
  '22sucs16': 'ABINAYA RAJESH', // keeping existing if no login provided
  '22SUCS16': 'ABINAYA RAJESH',
  '22SUCS18': 'DEEPAK KUMAR',
  '22SUCS19': 'VINAY SHARMA',
  '22SUCS20': 'MEENAKSHI PATEL',
  '22SUCS21': 'ABINAYA RAJESH',
  '22SUCS22': 'AILAMED NASEER',
  '23SUIT01': 'ANUSHIYA G',
  '23SUIT02': 'PRIYA SHARMA',
  '23SUIT03': 'RAHUL KUMAR',
  '23SUIT04': 'APARANA S',
  '23SUIT05': 'ARJUN G',
  '23SUIT06': 'BALA DHARSHAN R',
  '23SUIT07': 'BALAPORANI R P',
  '23SUIT08': 'CHANDRAN M',
  '23SUIT09': 'DHATCHAYINI M',
  '23SUIT10': 'DIVYA DHARSHINI P',
  '23SUIT11': 'GOKUL KANNAN N G',
  '23SUIT12': 'GOPIKA P',
  '23SUIT13': 'GOWTHAM P',
  '23SUIT14': 'HAMSAVANI R R',
  '23SUIT15': 'HARINI P',
  '23SUIT16': 'HARINI R M',
  '23SUIT17': 'INDHUMATHI M',
  '23SUIT18': 'JANANI G',
  '23SUIT19': 'VARUN SIDDHARTH',
  '23SUIT20': 'VIGNARAJKESH V',
  '23SUIT21': 'YUVARAJ S'
};

async function fixStudentNames() {
  try {
    console.log('Starting student name correction...');
    
    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students in database`);
    
    let updatedCount = 0;
    
    for (const student of students) {
      const regNo = student.personalInfo.regNo;
      const currentName = student.personalInfo.name;
      
      console.log(`\nChecking student: ${currentName} (${regNo})`);
      
      // Check if we have a correction for this registration number
      if (nameCorrections[regNo]) {
        const correctName = nameCorrections[regNo];
        
        if (currentName !== correctName) {
          console.log(`  Updating name from "${currentName}" to "${correctName}"`);
          
          // Update the student name
          await Student.findByIdAndUpdate(student._id, {
            'personalInfo.name': correctName
          });
          
          updatedCount++;
        } else {
          console.log(`  Name is already correct: ${correctName}`);
        }
      } else {
        console.log(`  No correction found for RegNo: ${regNo}`);
      }
    }
    
    console.log(`\n✅ Completed! Updated ${updatedCount} student names.`);
    
    // Show updated students
    console.log('\n📋 Updated students:');
    const updatedStudents = await Student.find({});
    updatedStudents.forEach(student => {
      console.log(`  ${student.personalInfo.name} (${student.personalInfo.regNo})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing student names:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixStudentNames();
