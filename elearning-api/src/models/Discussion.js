module.exports = (sequelize, DataTypes) => {
  const Discussion = sequelize.define('Discussion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    description: {
      type: DataTypes.TEXT
    },
    description_ar: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.ENUM('general', 'questions', 'announcements', 'assignments'),
      defaultValue: 'general'
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'discussions',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_pinned']
      },
      {
        fields: ['last_activity']
      }
    ]
  });

  Discussion.associate = function(models) {
    Discussion.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Discussion.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    Discussion.hasMany(models.DiscussionPost, {
      foreignKey: 'discussion_id',
      as: 'posts'
    });
  };

  return Discussion;
};