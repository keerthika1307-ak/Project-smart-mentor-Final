const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/mentors
// @desc    Get all mentors for students to start conversations
// @access  Private (Students only)
router.get('/mentors', authenticateToken, async (req, res) => {
  try {
    // Only allow students to access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Students only.'
      });
    }

    const mentors = await User.find({ 
      role: { $in: ['mentor', 'admin'] } 
    }).select('_id email role');

    res.json({
      success: true,
      data: mentors
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mentors'
    });
  }
});

module.exports = router;
