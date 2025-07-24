module.exports = (sequelize, DataTypes) => {
  const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    submission_text: {
      type: DataTypes.TEXT
    },
    submitted_files: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_late: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'returned', 'resubmitted'),
      defaultValue: 'submitted'
    },
    grade: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0
      }
    },
    feedback: {
      type: DataTypes.TEXT
    },
    feedback_ar: {
      type: DataTypes.TEXT
    },
    graded_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    graded_at: {
      type: DataTypes.DATE
    },
    attempt_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    plagiarism_score: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'assignment_submissions',
    indexes: [
      {
        fields: ['assignment_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['graded_by']
      },
      {
        fields: ['status']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['is_late']
      },
      {
        unique: true,
        fields: ['assignment_id', 'user_id', 'attempt_number']
      }
    ]
  });

  AssignmentSubmission.associate = function(models) {
    AssignmentSubmission.belongsTo(models.Assignment, {
      foreignKey: 'assignment_id',
      as: 'assignment'
    });
    AssignmentSubmission.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'student'
    });
    AssignmentSubmission.belongsTo(models.User, {
      foreignKey: 'graded_by',
      as: 'grader'
    });
  };

  return AssignmentSubmission;
};