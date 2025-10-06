const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, isMentorOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendBlackmarkNotification } = require('../utils/emailService');

const router = express.Router();

// Helper function to notify all admins
async function notifyAllAdmins(title, message, type = 'info', category = 'system') {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id email');
    
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

// @route   GET /api/mentors/dashboard
// @desc    Get mentor dashboard statistics
// @access  Private (Mentor/Admin)
router.get('/dashboard', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const students = await Student.find({})
      .populate('userId', 'email createdAt');

    const totalStudents = students.length;
    let totalAttendance = 0;
    let totalCGPA = 0;
    let lowAttendanceCount = 0;
    let lowCGPACount = 0;
    let blackmarksCount = 0;

    const cgpaDistribution = {
      excellent: 0, // 9-10
      good: 0,      // 7-8.9
      average: 0,   // 5-6.9
      poor: 0       // < 5
    };

    const recentActivities = [];

    students.forEach(student => {
      // Calculate overall attendance
      if (student.attendance.length > 0) {
        const avgAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
        totalAttendance += avgAttendance;
        
        if (avgAttendance < 75) {
          lowAttendanceCount++;
          recentActivities.push({
            type: 'attendance',
            message: `${student.personalInfo.name} has low attendance (${Math.round(avgAttendance)}%)`,
            date: new Date(),
            studentId: student._id
          });
        }
      }

      // CGPA analysis
      const cgpa = student.academics.cgpa || 0;
      totalCGPA += cgpa;

      if (cgpa < 6) {
        lowCGPACount++;
        recentActivities.push({
          type: 'cgpa',
          message: `${student.personalInfo.name} has low CGPA (${cgpa})`,
          date: new Date(),
          studentId: student._id
        });
      }

      // CGPA distribution
      if (cgpa >= 9) cgpaDistribution.excellent++;
      else if (cgpa >= 7) cgpaDistribution.good++;
      else if (cgpa >= 5) cgpaDistribution.average++;
      else cgpaDistribution.poor++;

      // Blackmarks
      if (student.blackmarks.length > 0) {
        blackmarksCount++;
        const highSeverityBlackmarks = student.blackmarks.filter(b => b.severity === 'High');
        if (highSeverityBlackmarks.length > 0) {
          recentActivities.push({
            type: 'blackmark',
            message: `${student.personalInfo.name} has ${highSeverityBlackmarks.length} high severity blackmark(s)`,
            date: new Date(),
            studentId: student._id
          });
        }
      }
    });

    const dashboardData = {
      statistics: {
        totalStudents,
        lowAttendanceStudents: lowAttendanceCount,
        lowCGPAStudents: lowCGPACount,
        studentsWithBlackmarks: blackmarksCount,
        averageAttendance: totalStudents > 0 ? Math.round((totalAttendance / totalStudents) * 100) / 100 : 0,
        averageCGPA: totalStudents > 0 ? Math.round((totalCGPA / totalStudents) * 100) / 100 : 0
      },
      recentActivities: recentActivities.slice(0, 10), // Latest 10 activities
      cgpaDistribution,
      alerts: {
        lowAttendance: lowAttendanceCount,
        lowCGPA: lowCGPACount,
        blackmarks: blackmarksCount
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get mentor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard'
    });
  }
});

// @route   GET /api/mentors/students
// @desc    Get all students with their details
// @access  Private (Mentor/Admin)
router.get('/students', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc', page = 1, limit = 20 } = req.query;

    let query = {};
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { 'personalInfo.name': { $regex: search, $options: 'i' } },
          { 'personalInfo.regNo': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Build sort object
    let sortObj = {};
    if (sortBy === 'name') sortObj['personalInfo.name'] = order === 'desc' ? -1 : 1;
    else if (sortBy === 'cgpa') sortObj['academics.cgpa'] = order === 'desc' ? -1 : 1;
    else if (sortBy === 'regNo') sortObj['personalInfo.regNo'] = order === 'desc' ? -1 : 1;
    else sortObj['createdAt'] = order === 'desc' ? -1 : 1;

    const students = await Student.find(query)
      .populate('userId', 'email createdAt')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    // Format student data
    const formattedStudents = students.map(student => {
      // Calculate overall attendance
      let overallAttendance = 0;
      if (student.attendance.length > 0) {
        overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
      }

      return {
        _id: student._id,
        name: student.personalInfo.name,
        regNo: student.personalInfo.regNo,
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

// @route   GET /api/mentors/student/:id
// @desc    Get detailed student information
// @access  Private (Mentor/Admin)
router.get('/student/:id', [authenticateToken, isMentorOrAdmin], async (req, res) => {
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

    // Calculate overall attendance
    let overallAttendance = 0;
    if (student.attendance.length > 0) {
      overallAttendance = student.attendance.reduce((sum, att) => sum + att.percentage, 0) / student.attendance.length;
    }

    const studentData = {
      _id: student._id,
      userId: student.userId,
      personalInfo: student.personalInfo,
      parentInfo: student.parentInfo,
      bankInfo: student.bankInfo,
      contactInfo: student.contactInfo,
      academics: student.academics,
      attendance: {
        overall: Math.round(overallAttendance * 100) / 100,
        history: student.attendance
      },
      blackmarks: student.blackmarks,
      aiFeedback: student.aiFeedback,
      profileCompleted: student.profileCompleted,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };

    res.json({
      success: true,
      data: studentData
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student details'
    });
  }
});

// @route   POST /api/mentors/student/:id/attendance
// @desc    Add attendance record for student
// @access  Private (Mentor/Admin)
router.post('/student/:id/attendance', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { month, year, daysPresent, totalDays } = req.body;

    if (!month || !year || daysPresent === undefined || !totalDays) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const percentage = Math.round((daysPresent / totalDays) * 100);

    // Check if attendance for this month/year already exists
    const existingIndex = student.attendance.findIndex(
      att => att.month === month && att.year === parseInt(year)
    );

    if (existingIndex !== -1) {
      // Update existing record
      student.attendance[existingIndex] = {
        month,
        year: parseInt(year),
        daysPresent: parseInt(daysPresent),
        totalDays: parseInt(totalDays),
        percentage,
        addedAt: new Date()
      };
    } else {
      // Add new record
      student.attendance.push({
        month,
        year: parseInt(year),
        daysPresent: parseInt(daysPresent),
        totalDays: parseInt(totalDays),
        percentage
      });
    }

    await student.save();

    // Notify all admins about attendance record
    await notifyAllAdmins(
      'Attendance Recorded',
      `Attendance recorded for ${student.personalInfo.name}: ${percentage}% (${daysPresent}/${totalDays} days) for ${month} ${year}`,
      percentage < 75 ? 'warning' : 'info',
      'attendance'
    );

    res.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        attendance: student.attendance
      }
    });
  } catch (error) {
    console.error('Add attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording attendance'
    });
  }
});

// @route   POST /api/mentors/student/:id/blackmark
// @desc    Add blackmark to student
// @access  Private (Mentor/Admin)
router.post('/student/:id/blackmark', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    const { reason, severity } = req.body;

    if (!reason || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Reason and severity are required'
      });
    }

    const student = await Student.findById(req.params.id).populate('userId', 'email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const blackmarkData = {
      reason,
      severity,
      assignedBy: req.user._id,
      assignedDate: new Date()
    };

    student.blackmarks.push(blackmarkData);
    await student.save();

    // Notify all admins about blackmark assignment
    await notifyAllAdmins(
      'Blackmark Assigned',
      `${severity} severity blackmark assigned to ${student.personalInfo.name}: ${reason}`,
      severity === 'High' ? 'error' : severity === 'Medium' ? 'warning' : 'info',
      'blackmark'
    );

    // Send email notification to student
    try {
      console.log(`📧 Attempting to send blackmark email notification...`);
      console.log(`📧 Student: ${student.personalInfo.name} (${student.userId.email})`);
      console.log(`📧 Mentor: ${req.user.email}`);
      console.log(`📧 Blackmark: ${severity} - ${reason}`);
      
      const emailResult = await sendBlackmarkNotification(
        student,
        {
          reason,
          severity,
          assignedDate: blackmarkData.assignedDate
        },
        req.user
      );
      
      console.log(`✅ Blackmark email sent successfully!`);
      console.log(`📧 Message ID: ${emailResult.messageId}`);
      console.log(`📧 Response: ${emailResult.response}`);
    } catch (emailError) {
      console.error('❌ Failed to send blackmark email:');
      console.error('❌ Error message:', emailError.message);
      console.error('❌ Error code:', emailError.code);
      console.error('❌ Full error:', emailError);
      // Don't fail the entire operation if email fails
    }

    res.json({
      success: true,
      message: 'Blackmark assigned successfully and student has been notified via email',
      data: {
        blackmarks: student.blackmarks
      }
    });
  } catch (error) {
    console.error('Add blackmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning blackmark'
    });
  }
});

module.exports = router;
