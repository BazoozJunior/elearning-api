const jwt = require('jsonwebtoken');
const { User, University } = require('../models');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        message_ar: 'غير مخول للوصول إلى هذا المسار'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'name_ar', 'code', 'domain', 'is_active']
        }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
          message_ar: 'المستخدم غير موجود'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
          message_ar: 'حساب المستخدم معطل'
        });
      }

      // Check if university is active
      if (user.university && !user.university.is_active) {
        return res.status(401).json({
          success: false,
          message: 'University is deactivated',
          message_ar: 'الجامعة معطلة'
        });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        message_ar: 'غير مخول للوصول إلى هذا المسار'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      message_ar: 'خطأ في الخادم أثناء المصادقة'
    });
  }
};

// Middleware to check for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        message_ar: 'غير مخول للوصول إلى هذا المسار'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
        message_ar: `دور المستخدم ${req.user.role} غير مخول للوصول إلى هذا المسار`
      });
    }

    next();
  };
};

// Middleware to check if user can access university resources
const checkUniversityAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      message_ar: 'المصادقة مطلوبة'
    });
  }

  // Super admin can access all universities
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user belongs to the requested university
  if (req.university && req.user.university_id !== req.university.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User does not belong to this university',
      message_ar: 'الوصول مرفوض: المستخدم لا ينتمي لهذه الجامعة'
    });
  }

  next();
};

// Middleware to check if user can access course resources
const checkCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        message_ar: 'المصادقة مطلوبة'
      });
    }

    const courseId = req.params.courseId || req.body.course_id;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
        message_ar: 'معرف الدورة مطلوب'
      });
    }

    // Super admin and university admin can access all courses in their university
    if (['super_admin', 'university_admin'].includes(req.user.role)) {
      return next();
    }

    // For other roles, check specific permissions
    const { Course, Enrollment } = require('../models');
    
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        message_ar: 'الدورة غير موجودة'
      });
    }

    // Check if user belongs to the same university as the course
    if (req.user.university_id !== course.university_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Course belongs to different university',
        message_ar: 'الوصول مرفوض: الدورة تنتمي لجامعة مختلفة'
      });
    }

    // Instructors can access their own courses
    if (req.user.role === 'professor' && course.instructor_id === req.user.id) {
      return next();
    }

    // Students must be enrolled in the course
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: req.user.id,
          course_id: courseId,
          status: 'enrolled'
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Not enrolled in this course',
          message_ar: 'الوصول مرفوض: غير مسجل في هذه الدورة'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Course access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during course access check',
      message_ar: 'خطأ في الخادم أثناء فحص الوصول للدورة'
    });
  }
};

module.exports = authMiddleware;
module.exports.authorize = authorize;
module.exports.checkUniversityAccess = checkUniversityAccess;
module.exports.checkCourseAccess = checkCourseAccess;