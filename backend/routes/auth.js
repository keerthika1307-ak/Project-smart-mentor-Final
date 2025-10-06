const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

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

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'admin'])
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

    const { email, password, role, adminSecret } = req.body;

    // Validate admin secret for admin registration
    if (role === 'admin') {
      if (!adminSecret || adminSecret !== process.env.MENTOR_SECRET) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin secret code'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role
    });

    await user.save();

    // If user is a student, create student profile with detailed information
    if (role === 'student') {
      const { studentData = {} } = req.body;
      
      const student = new Student({
        userId: user._id,
        personalInfo: {
          name: studentData.name || 'Student',
          regNo: studentData.regNo || '',
          dateOfBirth: studentData.dateOfBirth || null,
          gender: studentData.gender || ''
        },
        parentInfo: {
          fatherName: studentData.fatherName || '',
          fatherOccupation: studentData.fatherOccupation || '',
          motherName: studentData.motherName || '',
          motherOccupation: studentData.motherOccupation || ''
        },
        contactInfo: {
          mobile: studentData.mobile || '',
          address: studentData.address || ''
        },
        profileCompleted: !!studentData.regNo
      });
      await student.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Notify all admins about new registration
    if (role === 'student') {
      const { studentData = {} } = req.body;
      const studentName = studentData.fatherName ? `${studentData.fatherName}'s Child` : 'New Student';
      await notifyAllAdmins(
        'New Student Registration',
        `New student registered: ${studentName} (${email})`,
        'success',
        'academic'
      );
    } else if (role === 'admin') {
      await notifyAllAdmins(
        'New Admin Registration',
        `New admin registered: ${email}`,
        'info',
        'system'
      );
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
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

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Notify admins about login activity (only for important logins)
    if (user.role === 'admin') {
      await notifyAllAdmins(
        'Admin Login',
        `Admin logged in: ${user.email}`,
        'info',
        'system'
      );
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    let additionalData = {};
    
    // If user is a student, get student profile
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      additionalData.studentProfile = student;
    }

    res.json({
      success: true,
      data: {
        user,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

module.exports = router;
