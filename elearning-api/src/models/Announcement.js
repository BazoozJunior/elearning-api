module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    university_id: {
      type: DataTypes.UUID,
      references: {
        model: 'universities',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.UUID,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    title_ar: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 255]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content_ar: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM('general', 'urgent', 'academic', 'administrative', 'event'),
      defaultValue: 'general'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    published_at: {
      type: DataTypes.DATE
    },
    expires_at: {
      type: DataTypes.DATE
    },
    target_audience: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['all']
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    send_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    send_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'announcements',
    indexes: [
      {
        fields: ['university_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['type']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['published_at']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['is_pinned']
      }
    ]
  });

  Announcement.associate = function(models) {
    Announcement.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    Announcement.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Announcement.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return Announcement;
};