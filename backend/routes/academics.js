const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, isMentorOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper function to notify all admins
async function notifyAllAdmins(title, message, type = 'info', category = 'system') {
  try {
    const admins = await User.find({ role: 'admin' });
    
    const notifications = admins.map(admin => ({
      title,
      message,
      type,
      category,
      recipient: admin._id
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
}

// @route   GET /api/academics/student/:studentId
// @desc    Get student academic information
// @access  Private (Mentor/Admin)
router.get('/student/:studentId', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('userId', 'email')
      .select('personalInfo academics');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: {
        studentInfo: {
          name: student.personalInfo.name,
          regNo: student.personalInfo.regNo
        },
        academics: student.academics
      }
    });
  } catch (error) {
    console.error('Get student academics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching academic data'
    });
  }
});

// @route   POST /api/academics/subject
// @desc    Add subject and marks for a student
// @access  Private (Mentor/Admin)
router.post('/subject', [
  authenticateToken,
  isMentorOrAdmin,
  body('studentId').isMongoId(),
  body('subjectName').trim().isLength({ min: 1 }),
  body('marks').isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, subjectName, marks } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if subject already exists
    const existingSubjectIndex = student.academics.subjects.findIndex(
      subject => subject.name.toLowerCase() === subjectName.toLowerCase()
    );

    if (existingSubjectIndex !== -1) {
      // Update existing subject
      student.academics.subjects[existingSubjectIndex].marks = marks;
      student.academics.subjects[existingSubjectIndex].addedAt = new Date();
    } else {
      // Add new subject
      student.academics.subjects.push({
        name: subjectName,
        marks: marks
      });
    }

    // Update academic calculations
    student.updateAcademics();
    await student.save();

    // Notify all admins about marks entry
    await notifyAllAdmins(
      'Marks Added',
      `Marks ${existingSubjectIndex !== -1 ? 'updated' : 'added'} for ${student.personalInfo.name}: ${subjectName} - ${marks}/100`,
      marks < 40 ? 'warning' : 'success',
      'academic'
    );

    res.json({
      success: true,
      message: existingSubjectIndex !== -1 ? 'Subject marks updated successfully' : 'Subject added successfully',
      data: {
        academics: student.academics
      }
    });
  } catch (error) {
    console.error('Add/Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding subject'
    });
  }
});

// @route   DELETE /api/academics/subject/:studentId/:subjectId
// @desc    Remove a subject from student
// @access  Private (Mentor/Admin)
router.delete('/subject/:studentId/:subjectId', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove subject
    student.academics.subjects = student.academics.subjects.filter(
      subject => subject._id.toString() !== subjectId
    );

    // Update academic calculations
    student.updateAcademics();
    await student.save();

    res.json({
      success: true,
      message: 'Subject removed successfully',
      data: {
        academics: student.academics
      }
    });
  } catch (error) {
    console.error('Remove subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing subject'
    });
  }
});

// @route   GET /api/academics/overview
// @desc    Get academic overview statistics
// @access  Private (Mentor/Admin)
router.get('/overview', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const students = await Student.find({})
      .populate('userId', 'email')
      .select('personalInfo academics');

    const stats = {
      totalStudents: students.length,
      averageCGPA: 0,
      highPerformers: 0, // CGPA >= 8
      lowPerformers: 0,  // CGPA < 6
      cgpaDistribution: {
        excellent: 0, // 9-10
        good: 0,      // 7-8.9
        average: 0,   // 5-6.9
        poor: 0       // < 5
      }
    };

    if (students.length > 0) {
      const totalCGPA = students.reduce((sum, student) => sum + (student.academics.cgpa || 0), 0);
      stats.averageCGPA = Math.round((totalCGPA / students.length) * 100) / 100;

      students.forEach(student => {
        const cgpa = student.academics.cgpa || 0;
        
        if (cgpa >= 8) stats.highPerformers++;
        if (cgpa < 6) stats.lowPerformers++;

        if (cgpa >= 9) stats.cgpaDistribution.excellent++;
        else if (cgpa >= 7) stats.cgpaDistribution.good++;
        else if (cgpa >= 5) stats.cgpaDistribution.average++;
        else stats.cgpaDistribution.poor++;
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get academic overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching academic overview'
    });
  }
});

module.exports = router;
