const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, University } = require('../models');
const { requireTenant } = require('../middleware/tenantMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         first_name_ar:
 *           type: string
 *         last_name_ar:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, professor, teaching_assistant]
 *         student_id:
 *           type: string
 *         employee_id:
 *           type: string
 */

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  });
};

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', [
  requireTenant,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('role').isIn(['student', 'professor', 'teaching_assistant']),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        message_ar: 'فشل التحقق',
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      first_name,
      last_name,
      first_name_ar,
      last_name_ar,
      phone,
      role,
      student_id,
      employee_id
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
        message_ar: 'المستخدم موجود بالفعل بهذا البريد الإلكتروني'
      });
    }

    // Create user
    const user = await User.create({
      university_id: req.university.id,
      email,
      password,
      first_name,
      last_name,
      first_name_ar,
      last_name_ar,
      phone,
      role,
      student_id,
      employee_id,
      verification_token: crypto.randomBytes(20).toString('hex')
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`New user registered: ${email} at ${req.university.name}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      message_ar: 'تم تسجيل المستخدم بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          first_name_ar: user.first_name_ar,
          last_name_ar: user.last_name_ar,
          role: user.role,
          university: {
            id: req.university.id,
            name: req.university.name,
            name_ar: req.university.name_ar
          }
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      message_ar: 'خطأ في الخادم أثناء التسجيل'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  requireTenant,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        message_ar: 'فشل التحقق',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with university
    const user = await User.findOne({
      where: {
        email,
        university_id: req.university.id
      },
      include: [{
        model: University,
        as: 'university',
        attributes: ['id', 'name', 'name_ar', 'code', 'domain']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        message_ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        message_ar: 'الحساب معطل'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        message_ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User logged in: ${email} at ${req.university.name}`);

    res.json({
      success: true,
      message: 'Login successful',
      message_ar: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          first_name_ar: user.first_name_ar,
          last_name_ar: user.last_name_ar,
          role: user.role,
          preferred_language: user.preferred_language,
          university: user.university
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      message_ar: 'خطأ في الخادم أثناء تسجيل الدخول'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
        message_ar: 'رمز التحديث مطلوب'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        message_ar: 'رمز تحديث غير صالح'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      message_ar: 'تم تحديث الرمز بنجاح',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      message_ar: 'رمز تحديث غير صالح'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: University,
        as: 'university',
        attributes: ['id', 'name', 'name_ar', 'code', 'domain']
      }],
      attributes: { exclude: ['password', 'verification_token', 'reset_password_token'] }
    });

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout successful',
      message_ar: 'تم تسجيل الخروج بنجاح'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

// OAuth routes would be implemented here
// router.get('/google', passport.authenticate('google-oauth2'));
// router.get('/google/callback', passport.authenticate('google-oauth2'), ...);
// router.get('/microsoft', passport.authenticate('microsoft-oauth2'));
// router.get('/microsoft/callback', passport.authenticate('microsoft-oauth2'), ...);

module.exports = router;