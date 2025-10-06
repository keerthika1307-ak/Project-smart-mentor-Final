const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  personalInfo: {
    name: { type: String, required: true },
    regNo: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] }
  },
  
  // Parent Information
  parentInfo: {
    fatherName: { type: String },
    fatherOccupation: { type: String },
    motherName: { type: String },
    motherOccupation: { type: String }
  },
  
  // Contact Information
  contactInfo: {
    mobile: { type: String, required: true },
    address: { type: String }
  },
  
  // Academic Information
  academics: {
    subjects: [{
      name: { type: String, required: true },
      marks: { type: Number, min: 0, max: 100 },
      addedAt: { type: Date, default: Date.now }
    }],
    totalMarks: { type: Number, default: 0 },
    averagePercentage: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 }
  },
  
  // Attendance
  attendance: [{
    month: { type: String, required: true },
    year: { type: Number, required: true },
    daysPresent: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    percentage: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Blackmarks
  blackmarks: [{
    reason: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now }
  }],
  
  // AI Feedback (keeping for backward compatibility)
  aiFeedback: {
    lastFeedback: { type: String },
    lastUpdated: { type: Date },
    feedbackType: { type: String },
    generatedBy: { type: String },
    mentorName: { type: String },
    mentorEmail: { type: String }
  },
  
  // Feedback History (new system for multiple feedback entries)
  feedbackHistory: [{
    feedback: { type: String, required: true },
    feedbackType: { 
      type: String, 
      enum: ['academic', 'attendance', 'behavior', 'overall'],
      default: 'general'
    },
    createdAt: { type: Date, default: Date.now },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentorName: { type: String },
    mentorEmail: { type: String }
  }],
  
  // Profile completion status
  profileCompleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate CGPA based on percentage
studentSchema.methods.calculateCGPA = function(percentage) {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  return 6;
};

// Update academic calculations
studentSchema.methods.updateAcademics = function() {
  const subjects = this.academics.subjects;
  if (subjects.length > 0) {
    const totalMarks = subjects.reduce((sum, subject) => sum + (subject.marks || 0), 0);
    this.academics.totalMarks = totalMarks;
    this.academics.averagePercentage = totalMarks / subjects.length;
    this.academics.cgpa = this.calculateCGPA(this.academics.averagePercentage);
  }
};

// Update timestamp on save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
