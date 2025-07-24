const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    logger.error(`Validation Error: ${JSON.stringify(errors)}`);
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    const field = err.errors[0]?.path || 'unknown';
    
    logger.error(`Unique Constraint Error: ${field} - ${message}`);
    
    return res.status(statusCode).json({
      success: false,
      message,
      field,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
    
    logger.error(`Foreign Key Constraint Error: ${message}`);
    
    return res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Log error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Get user language preference
  const language = req.user?.preferred_language || req.headers['accept-language']?.includes('ar') ? 'ar' : 'en';
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message,
    ...(language === 'ar' && getArabicMessage(message) && { message_ar: getArabicMessage(message) }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

// Helper function to get Arabic error messages
const getArabicMessage = (message) => {
  const arabicMessages = {
    'Not Found': 'غير موجود',
    'Resource not found': 'المورد غير موجود',
    'Validation Error': 'خطأ في التحقق',
    'Resource already exists': 'المورد موجود بالفعل',
    'Invalid reference to related resource': 'مرجع غير صالح للمورد ذي الصلة',
    'Invalid token': 'رمز غير صالح',
    'Token expired': 'انتهت صلاحية الرمز',
    'File too large': 'الملف كبير جداً',
    'Too many files': 'ملفات كثيرة جداً',
    'Unexpected file field': 'حقل ملف غير متوقع',
    'Unauthorized': 'غير مخول',
    'Forbidden': 'محظور',
    'Internal Server Error': 'خطأ داخلي في الخادم'
  };
  
  return arabicMessages[message] || null;
};

module.exports = {
  notFound,
  errorHandler,
};