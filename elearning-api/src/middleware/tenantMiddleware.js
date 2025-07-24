const { University } = require('../models');
const logger = require('../utils/logger');

const tenantMiddleware = async (req, res, next) => {
  try {
    // Skip tenant resolution for certain routes
    const skipRoutes = ['/health', '/api-docs', '/auth/login', '/auth/register'];
    const isSkipRoute = skipRoutes.some(route => req.path.includes(route));
    
    if (isSkipRoute) {
      return next();
    }

    // Get university domain from header or subdomain
    let universityDomain = req.headers['x-university-domain'];
    
    // If no header, try to extract from subdomain
    if (!universityDomain) {
      const host = req.get('host');
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          universityDomain = subdomain;
        }
      }
    }

    // If still no domain, check if it's in the request body (for registration)
    if (!universityDomain && req.body && req.body.university_domain) {
      universityDomain = req.body.university_domain;
    }

    if (universityDomain) {
      // Find university by domain
      const university = await University.findOne({
        where: { 
          domain: universityDomain,
          is_active: true 
        }
      });

      if (university) {
        // Attach university to request
        req.university = university;
        req.universityId = university.id;
        
        // Set response header for client
        res.setHeader('X-University-ID', university.id);
        res.setHeader('X-University-Name', university.name);
        
        logger.debug(`Tenant resolved: ${university.name} (${university.domain})`);
      } else {
        // University not found or inactive
        logger.warn(`University not found or inactive for domain: ${universityDomain}`);
        return res.status(404).json({
          success: false,
          message: 'University not found or inactive',
          message_ar: 'الجامعة غير موجودة أو غير نشطة'
        });
      }
    } else {
      // No university domain provided - this might be a super admin request
      logger.debug('No university domain provided in request');
    }

    next();
  } catch (error) {
    logger.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving university tenant',
      message_ar: 'خطأ في تحديد الجامعة'
    });
  }
};

// Middleware to ensure tenant context is required
const requireTenant = (req, res, next) => {
  if (!req.university) {
    return res.status(400).json({
      success: false,
      message: 'University context is required',
      message_ar: 'سياق الجامعة مطلوب'
    });
  }
  next();
};

// Middleware to ensure user belongs to the current tenant
const validateTenantAccess = (req, res, next) => {
  if (req.user && req.university) {
    if (req.user.university_id !== req.university.id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: User does not belong to this university',
        message_ar: 'الوصول مرفوض: المستخدم لا ينتمي لهذه الجامعة'
      });
    }
  }
  next();
};

module.exports = {
  tenantMiddleware,
  requireTenant,
  validateTenantAccess
};