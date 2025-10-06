const express = require('express');
const { authenticateToken, isMentorOrAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Test route
router.get('/test', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'AI route working' });
});

// @route   POST /api/ai/feedback/:studentId
// @desc    Generate and save AI feedback for a student
// @access  Private (Mentor/Admin)
router.post('/feedback/:studentId', [
  authenticateToken,
  isMentorOrAdmin,
  body('feedback').trim().isLength({ min: 10 }).withMessage('Feedback must be at least 10 characters'),
  body('type').isIn(['academic', 'attendance', 'behavior', 'overall']).withMessage('Invalid feedback type')
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

    const { studentId } = req.params;
    const { feedback, type } = req.body;

    // Find student
    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add to feedback history (new system)
    student.feedbackHistory.push({
      feedback: feedback,
      feedbackType: type,
      createdAt: new Date(),
      mentorId: req.user.id,
      mentorName: req.user.email.split('@')[0],
      mentorEmail: req.user.email
    });

    // Update latest feedback (for backward compatibility)
    student.aiFeedback = {
      lastFeedback: feedback,
      lastUpdated: new Date(),
      feedbackType: type,
      generatedBy: req.user.id,
      mentorName: req.user.email.split('@')[0],
      mentorEmail: req.user.email
    };

    await student.save();

    res.json({
      success: true,
      message: 'AI feedback saved successfully',
      data: {
        feedback: student.aiFeedback
      }
    });

  } catch (error) {
    console.error('Save feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving feedback'
    });
  }
});

// @route   GET /api/ai/feedback/:studentId
// @desc    Get AI feedback for a student
// @access  Private
router.get('/feedback/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if user can access this student's data
    if (req.user.role === 'student' && student.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        feedback: student.aiFeedback || {
          lastFeedback: null,
          lastUpdated: null,
          feedbackType: null
        }
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving feedback'
    });
  }
});

// @route   GET /api/ai/recent-feedback
// @desc    Get recent feedback sent by mentors
// @access  Private (Mentor/Admin)
router.get('/recent-feedback', [authenticateToken, isMentorOrAdmin], async (req, res) => {
  try {
    // Find students with feedback history from this mentor
    const students = await Student.find({
      'feedbackHistory.mentorId': req.user.id
    })
    .populate('userId', 'email')
    .sort({ 'feedbackHistory.createdAt': -1 });

    const recentFeedback = [];
    
    students.forEach(student => {
      // Get all feedback from this mentor for this student
      const mentorFeedback = student.feedbackHistory
        .filter(fb => fb.mentorId.toString() === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      mentorFeedback.forEach(feedback => {
        recentFeedback.push({
          studentId: student._id,
          studentName: student.personalInfo.name,
          studentRegNo: student.personalInfo.regNo,
          feedbackType: feedback.feedbackType,
          feedback: feedback.feedback,
          createdAt: feedback.createdAt,
          preview: feedback.feedback.substring(0, 100) + '...'
        });
      });
    });

    // Sort by creation date and limit to 10 most recent
    recentFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedFeedback = recentFeedback.slice(0, 10);

    res.json({
      success: true,
      data: limitedFeedback
    });

  } catch (error) {
    console.error('Get recent feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving recent feedback'
    });
  }
});

// @route   GET /api/ai/feedback-history/:studentId
// @desc    Get all feedback history for a student
// @access  Private (Student can see own, Mentor/Admin can see any)
router.get('/feedback-history/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if user can access this student's data
    if (req.user.role === 'student' && student.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all feedback history sorted by most recent first
    const feedbackHistory = student.feedbackHistory
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(feedback => ({
        id: feedback._id,
        feedback: feedback.feedback,
        feedbackType: feedback.feedbackType,
        createdAt: feedback.createdAt,
        mentorName: feedback.mentorName,
        mentorEmail: feedback.mentorEmail
      }));

    res.json({
      success: true,
      data: {
        studentName: student.personalInfo.name,
        studentRegNo: student.personalInfo.regNo,
        feedbackHistory: feedbackHistory,
        totalFeedback: feedbackHistory.length
      }
    });

  } catch (error) {
    console.error('Get feedback history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving feedback history'
    });
  }
});

module.exports = router;
