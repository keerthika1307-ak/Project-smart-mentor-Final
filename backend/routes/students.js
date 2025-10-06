const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, isStudent, isMentorOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendAttendanceNotification, sendBulkAttendanceNotifications } = require('../utils/emailService');

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

// @route   GET /api/students/dashboard
// @desc    Get student dashboard data
// @access  Private (Student, or Admin/Mentor with studentId param)
router.get('/dashboard', [authenticateToken], async (req, res) => {
  try {
    let student;
    
    // If user is student, get their own data
    if (req.user.role === 'student') {
      student = await Student.findOne({ userId: req.user._id })
        .populate('userId', 'email');
    } 
    // If user is admin/mentor and studentId is provided, get that student's data
    else if ((req.user.role === 'admin' || req.user.role === 'mentor') && req.query.studentId) {
      student = await Student.findById(req.query.studentId)
        .populate('userId', 'email');
    }
    // If user is admin/mentor but no studentId, deny access
    else if (req.user.role === 'admin' || req.user.role === 'mentor') {
      return res.status(400).json({
        success: false,
        message: 'Student ID required for admin/mentor access'
      });
    }
    // If user has invalid role
    else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid user role.'
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get latest attendance
    const latestAttendance = student.attendance.length > 0 
      ? student.attendance[student.attendance.length - 1] 
      : null;

    // Calculate overall attendance percentage
    const overallAttendance = student.attendance.length > 0
      ? student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length
      : 0;

    const dashboardData = {
      studentId: student._id,
      personalInfo: student.personalInfo,
      contactInfo: student.contactInfo,
      parentInfo: student.parentInfo,
      academics: {
        subjects: student.academics.subjects,
        totalMarks: student.academics.totalMarks,
        averagePercentage: student.academics.averagePercentage,
        cgpa: student.academics.cgpa,
        subjectCount: student.academics.subjects.length
      },
      attendance: {
        latest: latestAttendance,
        overall: Math.round(overallAttendance * 100) / 100,
        history: student.attendance.slice(-6) // Last 6 months
      },
      blackmarks: {
        total: student.blackmarks.length,
        recent: student.blackmarks.slice(-5), // Last 5 blackmarks
        highSeverity: student.blackmarks.filter(b => b.severity === 'High').length
      },
      aiFeedback: student.aiFeedback,
      profileCompleted: student.profileCompleted
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard'
    });
  }
});

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/profile', [authenticateToken, isStudent], async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'email createdAt');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Private (Student)
router.put('/profile', [
  authenticateToken,
  isStudent,
  body('personalInfo.name').optional().trim().isLength({ min: 1 }),
  body('personalInfo.regNo').optional().trim().isLength({ min: 1 }),
  body('contactInfo.mobile').optional().trim().isLength({ min: 10 })
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

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update allowed fields
    const updateFields = ['personalInfo', 'parentInfo', 'bankInfo', 'contactInfo'];
    updateFields.forEach(field => {
      if (req.body[field]) {
        student[field] = { ...student[field].toObject(), ...req.body[field] };
      }
    });

    // Check if profile is completed
    const requiredFields = [
      student.personalInfo.name,
      student.personalInfo.regNo,
      student.contactInfo.mobile
    ];
    student.profileCompleted = requiredFields.every(field => field && field.trim() !== '');

    await student.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/students
// @desc    Get all students (for admin)
// @access  Private (Mentor/Admin)
router.get('/', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { search, page = 1, limit = 20, all = false } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { 'personalInfo.name': { $regex: search, $options: 'i' } },
          { 'personalInfo.regNo': { $regex: search, $options: 'i' } }
        ]
      };
    }

    let studentsQuery = Student.find(query)
      .populate('userId', 'email createdAt')
      .sort({ 'personalInfo.name': 1 });

    // If 'all' parameter is true, don't apply pagination
    if (all === 'true') {
      // No limit or skip for fetching all students
    } else {
      studentsQuery = studentsQuery
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    const students = await studentsQuery;

    const total = await Student.countDocuments(query);

    // Format student data with proper names
    const formattedStudents = students.map(student => {
      let overallAttendance = 0;
      if (student.attendance.length > 0) {
        overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
      }

      return {
        _id: student._id,
        name: student.personalInfo.name || 'No Name',
        regNo: student.personalInfo.regNo || 'No Reg No',
        email: student.userId?.email || 'N/A',
        cgpa: student.academics.cgpa || 0,
        attendance: Math.round(overallAttendance * 100) / 100,
        blackmarks: student.blackmarks.length,
        profileCompleted: student.profileCompleted,
        createdAt: student.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: formattedStudents.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID (for admin)
// @access  Private (Mentor/Admin)
router.get('/:id', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email createdAt lastLogin')
      .populate('blackmarks.assignedBy', 'email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student by ID (for admin)
// @access  Private (Mentor/Admin)
router.put('/:id', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update allowed fields
    const updateFields = ['personalInfo', 'parentInfo', 'bankInfo', 'contactInfo'];
    updateFields.forEach(field => {
      if (req.body[field]) {
        student[field] = { ...student[field].toObject(), ...req.body[field] };
      }
    });

    // Check if profile is completed
    const requiredFields = [
      student.personalInfo.name,
      student.personalInfo.regNo,
      student.contactInfo.mobile
    ];
    student.profileCompleted = requiredFields.every(field => field && field.trim() !== '');

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
});

// @route   POST /api/students
// @desc    Create new student (for admin)
// @access  Private (Mentor/Admin)
router.post('/', [
  authenticateToken,
  isMentorOrAdmin,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('personalInfo.name').trim().isLength({ min: 1 }),
  body('personalInfo.regNo').trim().isLength({ min: 1 }),
  body('contactInfo.mobile').trim().isLength({ min: 10 })
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

    const { email, password, personalInfo, parentInfo, bankInfo, contactInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if registration number already exists
    const existingStudent = await Student.findOne({ 'personalInfo.regNo': personalInfo.regNo });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this registration number already exists'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      role: 'student'
    });
    await user.save();

    // Create student profile
    const student = new Student({
      userId: user._id,
      personalInfo,
      parentInfo: parentInfo || {},
      bankInfo: bankInfo || {},
      contactInfo,
      profileCompleted: true
    });
    await student.save();

    // Notify all admins about new student registration
    await notifyAllAdmins(
      'New Student Registered',
      `New student registered: ${personalInfo.name} (${personalInfo.regNo}) - ${email}`,
      'success',
      'academic'
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student: await student.populate('userId', 'email')
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (for admin)
// @access  Private (Mentor/Admin)
router.delete('/:id', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user account
    await User.findByIdAndDelete(student.userId);
    
    // Delete student profile
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
});

// @route   POST /api/students/:id/attendance
// @desc    Add/Update attendance for a student
// @access  Private (Mentor/Admin)
router.post('/:id/attendance', [
  authenticateToken,
  isMentorOrAdmin,
  body('month').trim().isLength({ min: 1 }),
  body('year').isInt({ min: 2020, max: 2030 }),
  body('daysPresent').isInt({ min: 0 }),
  body('totalDays').isInt({ min: 1 })
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

    const { month, year, daysPresent, totalDays } = req.body;
    const studentId = req.params.id;

    // Validate attendance data
    if (daysPresent > totalDays) {
      return res.status(400).json({
        success: false,
        message: 'Days present cannot be greater than total days'
      });
    }

    const student = await Student.findById(studentId).populate('userId', 'email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate attendance percentage
    const percentage = (daysPresent / totalDays) * 100;

    // Check if attendance record for this month/year already exists
    const existingAttendanceIndex = student.attendance.findIndex(
      att => att.month === month && att.year === year
    );

    const attendanceRecord = {
      month,
      year,
      daysPresent,
      totalDays,
      percentage,
      addedAt: new Date()
    };

    if (existingAttendanceIndex !== -1) {
      // Update existing attendance record
      student.attendance[existingAttendanceIndex] = attendanceRecord;
    } else {
      // Add new attendance record
      student.attendance.push(attendanceRecord);
    }

    await student.save();

    // Send email notification to student
    try {
      await sendAttendanceNotification(student, attendanceRecord);
      console.log(`📧 Attendance email sent to ${student.personalInfo.name}`);
    } catch (emailError) {
      console.error('Failed to send attendance email:', emailError);
      // Don't fail the request if email fails
    }

    // Notify all admins about attendance update
    await notifyAllAdmins(
      'Attendance Updated',
      `Attendance ${existingAttendanceIndex !== -1 ? 'updated' : 'added'} for ${student.personalInfo.name}: ${month} ${year} - ${percentage.toFixed(1)}%`,
      percentage < 75 ? 'warning' : 'success',
      'attendance'
    );

    res.json({
      success: true,
      message: `Attendance ${existingAttendanceIndex !== -1 ? 'updated' : 'added'} successfully. Email notification sent to student.`,
      data: {
        attendance: attendanceRecord,
        emailSent: true
      }
    });
  } catch (error) {
    console.error('Add/Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating attendance'
    });
  }
});

// @route   POST /api/students/attendance/bulk
// @desc    Add attendance for multiple students
// @access  Private (Mentor/Admin)
router.post('/attendance/bulk', [
  authenticateToken,
  isMentorOrAdmin,
  body('attendanceData').isArray().notEmpty(),
  body('attendanceData.*.studentId').isMongoId(),
  body('attendanceData.*.month').trim().isLength({ min: 1 }),
  body('attendanceData.*.year').isInt({ min: 2020, max: 2030 }),
  body('attendanceData.*.daysPresent').isInt({ min: 0 }),
  body('attendanceData.*.totalDays').isInt({ min: 1 })
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

    const { attendanceData } = req.body;
    const results = [];
    const emailData = [];

    for (const data of attendanceData) {
      const { studentId, month, year, daysPresent, totalDays } = data;

      // Validate attendance data
      if (daysPresent > totalDays) {
        results.push({
          studentId,
          success: false,
          message: 'Days present cannot be greater than total days'
        });
        continue;
      }

      try {
        const student = await Student.findById(studentId).populate('userId', 'email');
        if (!student) {
          results.push({
            studentId,
            success: false,
            message: 'Student not found'
          });
          continue;
        }

        // Calculate attendance percentage
        const percentage = (daysPresent / totalDays) * 100;

        // Check if attendance record for this month/year already exists
        const existingAttendanceIndex = student.attendance.findIndex(
          att => att.month === month && att.year === year
        );

        const attendanceRecord = {
          month,
          year,
          daysPresent,
          totalDays,
          percentage,
          addedAt: new Date()
        };

        if (existingAttendanceIndex !== -1) {
          // Update existing attendance record
          student.attendance[existingAttendanceIndex] = attendanceRecord;
        } else {
          // Add new attendance record
          student.attendance.push(attendanceRecord);
        }

        await student.save();

        // Prepare email data
        emailData.push({
          student,
          attendance: attendanceRecord
        });

        results.push({
          studentId,
          studentName: student.personalInfo.name,
          success: true,
          message: `Attendance ${existingAttendanceIndex !== -1 ? 'updated' : 'added'} successfully`,
          percentage: percentage.toFixed(1)
        });

      } catch (error) {
        console.error(`Error updating attendance for student ${studentId}:`, error);
        results.push({
          studentId,
          success: false,
          message: 'Server error while updating attendance'
        });
      }
    }

    // Send bulk email notifications
    let emailResults = { successful: 0, failed: 0 };
    if (emailData.length > 0) {
      try {
        emailResults = await sendBulkAttendanceNotifications(emailData);
        console.log(`📧 Bulk attendance emails: ${emailResults.successful} sent, ${emailResults.failed} failed`);
      } catch (emailError) {
        console.error('Failed to send bulk attendance emails:', emailError);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk attendance update completed: ${successCount} successful, ${failCount} failed. ${emailResults.successful} emails sent.`,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failCount,
          emailsSent: emailResults.successful,
          emailsFailed: emailResults.failed
        }
      }
    });
  } catch (error) {
    console.error('Bulk attendance update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bulk attendance'
    });
  }
});

// @route   GET /api/students/:id/attendance
// @desc    Get student attendance history
// @access  Private (Mentor/Admin or Student themselves)
router.get('/:id/attendance', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if user is accessing their own data or is mentor/admin
    const student = await Student.findById(studentId).populate('userId', 'email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Authorization check
    const isOwnData = student.userId._id.toString() === req.user._id.toString();
    const isMentorAdmin = req.user.role === 'mentor' || req.user.role === 'admin';
    
    if (!isOwnData && !isMentorAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate overall attendance statistics
    const attendanceHistory = student.attendance.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return new Date(`${b.month} 1, ${b.year}`) - new Date(`${a.month} 1, ${a.year}`);
    });

    const overallStats = {
      totalRecords: attendanceHistory.length,
      averageAttendance: 0,
      totalDaysPresent: 0,
      totalDays: 0,
      overallPercentage: 0
    };

    if (attendanceHistory.length > 0) {
      overallStats.totalDaysPresent = attendanceHistory.reduce((sum, att) => sum + att.daysPresent, 0);
      overallStats.totalDays = attendanceHistory.reduce((sum, att) => sum + att.totalDays, 0);
      overallStats.overallPercentage = (overallStats.totalDaysPresent / overallStats.totalDays) * 100;
      overallStats.averageAttendance = attendanceHistory.reduce((sum, att) => sum + att.percentage, 0) / attendanceHistory.length;
    }

    res.json({
      success: true,
      data: {
        studentInfo: {
          name: student.personalInfo.name,
          regNo: student.personalInfo.regNo,
          email: student.userId.email
        },
        attendanceHistory,
        overallStats: {
          ...overallStats,
          averageAttendance: Math.round(overallStats.averageAttendance * 100) / 100,
          overallPercentage: Math.round(overallStats.overallPercentage * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance history'
    });
  }
});

// @route   DELETE /api/students/:id/attendance/:attendanceId
// @desc    Delete attendance record
// @access  Private (Mentor/Admin)
router.delete('/:id/attendance/:attendanceId', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { id: studentId, attendanceId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove attendance record
    const initialLength = student.attendance.length;
    student.attendance = student.attendance.filter(
      att => att._id.toString() !== attendanceId
    );

    if (student.attendance.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await student.save();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting attendance record'
    });
  }
});

module.exports = router;
