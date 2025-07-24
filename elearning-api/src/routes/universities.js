const express = require('express');
const { University, User, Faculty, Course } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     University:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         name_ar:
 *           type: string
 *         code:
 *           type: string
 *         domain:
 *           type: string
 *         logo_url:
 *           type: string
 *         description:
 *           type: string
 *         description_ar:
 *           type: string
 *         address:
 *           type: string
 *         address_ar:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         website:
 *           type: string
 *         established_year:
 *           type: integer
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/universities:
 *   get:
 *     summary: Get all universities (public endpoint)
 *     tags: [Universities]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
 *     responses:
 *       200:
 *         description: List of universities
 */
router.get('/', async (req, res) => {
  try {
    const { active, search, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (active !== undefined) {
      where.is_active = active === 'true';
    }
    
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { name_ar: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: universities } = await University.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'name_ar', 'code', 'domain', 'logo_url',
        'description', 'description_ar', 'established_year', 'is_active'
      ],
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        universities,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get universities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

/**
 * @swagger
 * /api/v1/universities/{id}:
 *   get:
 *     summary: Get university by ID
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University details
 *       404:
 *         description: University not found
 */
router.get('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id, {
      include: [
        {
          model: Faculty,
          as: 'faculties',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'name_ar', 'code']
        }
      ]
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
        message_ar: 'الجامعة غير موجودة'
      });
    }

    // Get statistics
    const stats = await Promise.all([
      User.count({ where: { university_id: university.id, is_active: true } }),
      Course.count({ where: { university_id: university.id, is_active: true } }),
      Faculty.count({ where: { university_id: university.id, is_active: true } })
    ]);

    res.json({
      success: true,
      data: {
        university: {
          ...university.toJSON(),
          stats: {
            total_users: stats[0],
            total_courses: stats[1],
            total_faculties: stats[2]
          }
        }
      }
    });

  } catch (error) {
    logger.error('Get university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

/**
 * @swagger
 * /api/v1/universities:
 *   post:
 *     summary: Create a new university (Super Admin Only)
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - name_ar
 *               - code
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *               name_ar:
 *                 type: string
 *               code:
 *                 type: string
 *               domain:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               description:
 *                 type: string
 *               description_ar:
 *                 type: string
 *               address:
 *                 type: string
 *               address_ar:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               established_year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: University created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', [
  authMiddleware,
  authorize('super_admin'),
  body('name').trim().notEmpty(),
  body('name_ar').trim().notEmpty(),
  body('code').trim().isLength({ min: 2, max: 10 }).isUppercase(),
  body('domain').isURL(),
  body('email').optional().isEmail(),
  body('website').optional().isURL(),
  body('established_year').optional().isInt({ min: 1800, max: new Date().getFullYear() })
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

    const university = await University.create(req.body);

    logger.info(`New university created: ${university.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      message_ar: 'تم إنشاء الجامعة بنجاح',
      data: { university }
    });

  } catch (error) {
    logger.error('Create university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

/**
 * @swagger
 * /api/v1/universities/{id}:
 *   put:
 *     summary: Update university (Super Admin or University Admin)
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: University not found
 */
router.put('/:id', [
  authMiddleware,
  authorize('super_admin', 'university_admin')
], async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
        message_ar: 'الجامعة غير موجودة'
      });
    }

    // University admin can only update their own university
    if (req.user.role === 'university_admin' && req.user.university_id !== university.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        message_ar: 'الوصول مرفوض'
      });
    }

    // Prevent updating critical fields by non-super-admin
    const allowedFields = req.user.role === 'super_admin' 
      ? Object.keys(req.body)
      : Object.keys(req.body).filter(field => !['code', 'domain', 'is_active', 'subscription_plan'].includes(field));

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await university.update(updateData);

    logger.info(`University updated: ${university.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'University updated successfully',
      message_ar: 'تم تحديث الجامعة بنجاح',
      data: { university }
    });

  } catch (error) {
    logger.error('Update university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

/**
 * @swagger
 * /api/v1/universities/{id}/stats:
 *   get:
 *     summary: Get university statistics
 *     tags: [Universities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University statistics
 */
router.get('/:id/stats', [
  authMiddleware,
  authorize('super_admin', 'university_admin')
], async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
        message_ar: 'الجامعة غير موجودة'
      });
    }

    // Check access permissions
    if (req.user.role === 'university_admin' && req.user.university_id !== university.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        message_ar: 'الوصول مرفوض'
      });
    }

    // Get comprehensive statistics
    const stats = await Promise.all([
      User.count({ 
        where: { university_id: university.id, is_active: true },
        group: ['role']
      }),
      Course.count({ where: { university_id: university.id, is_active: true } }),
      Faculty.count({ where: { university_id: university.id, is_active: true } }),
      // Add more statistics as needed
    ]);

    const userStats = stats[0].reduce((acc, stat) => {
      acc[stat.role] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stats: {
          users: userStats,
          total_courses: stats[1],
          total_faculties: stats[2],
          total_users: Object.values(userStats).reduce((sum, count) => sum + parseInt(count), 0)
        }
      }
    });

  } catch (error) {
    logger.error('Get university stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      message_ar: 'خطأ في الخادم'
    });
  }
});

module.exports = router;