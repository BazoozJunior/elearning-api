module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    description_ar: {
      type: DataTypes.TEXT
    },
    instructions: {
      type: DataTypes.TEXT
    },
    instructions_ar: {
      type: DataTypes.TEXT
    },
    max_points: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    available_from: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    late_submission_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    late_penalty_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10,
      validate: {
        min: 0,
        max: 100
      }
    },
    submission_type: {
      type: DataTypes.ENUM('file', 'text', 'both'),
      defaultValue: 'file'
    },
    allowed_file_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['pdf', 'doc', 'docx']
    },
    max_file_size_mb: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: 1,
        max: 100
      }
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_group_assignment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    max_group_size: {
      type: DataTypes.INTEGER,
      validate: {
        min: 2,
        max: 10
      }
    },
    rubric: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'assignments',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['due_date']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['available_from']
      }
    ]
  });

  Assignment.associate = function(models) {
    Assignment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Assignment.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    Assignment.hasMany(models.AssignmentSubmission, {
      foreignKey: 'assignment_id',
      as: 'submissions'
    });
  };

  return Assignment;
};