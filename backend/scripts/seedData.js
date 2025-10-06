const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@smartmentor.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@smartmentor.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@smartmentor.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

// Seed mentor user
const seedMentor = async () => {
  try {
    const mentorExists = await User.findOne({ email: 'mentor@smartmentor.com' });
    if (!mentorExists) {
      const mentor = new User({
        email: 'mentor@smartmentor.com',
        password: 'mentor123',
        role: 'mentor'
      });
      await mentor.save();
      console.log('✅ Mentor user created: mentor@smartmentor.com / mentor123');
    } else {
      console.log('ℹ️ Mentor user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating mentor:', error);
  }
};

// Seed a sample student
const seedSampleStudent = async () => {
  try {
    const studentExists = await User.findOne({ email: '23suit01@student.smartmentor.com' });
    if (!studentExists) {
      const user = new User({
        email: '23suit01@student.smartmentor.com',
        password: 'student123',
        role: 'student'
      });
      await user.save();

      const student = new Student({
        userId: user._id,
        personalInfo: {
          name: 'AHAMED NASEER N',
          regNo: '23SUIT01'
        },
        contactInfo: {
          mobile: '8807105016'
        },
        academics: {
          subjects: [
            { name: 'Mathematics', marks: 85 },
            { name: 'Physics', marks: 78 },
            { name: 'Chemistry', marks: 82 }
          ]
        },
        profileCompleted: true
      });

      // Update academic calculations
      student.updateAcademics();
      await student.save();

      console.log('✅ Sample student created: 23suit01@student.smartmentor.com / student123');
    } else {
      console.log('ℹ️ Sample student already exists');
    }
  } catch (error) {
    console.error('❌ Error creating sample student:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await seedAdmin();
    await seedMentor();
    await seedSampleStudent();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@smartmentor.com / admin123');
    console.log('Mentor: mentor@smartmentor.com / mentor123');
    console.log('Student: 23suit01@student.smartmentor.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
