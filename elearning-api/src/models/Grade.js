module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    assignment_id: {
      type: DataTypes.UUID,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    exam_id: {
      type: DataTypes.UUID,
      references: {
        model: 'exams',
        key: 'id'
      }
    },
    grade_type: {
      type: DataTypes.ENUM('assignment', 'exam', 'quiz', 'participation', 'final'),
      allowNull: false
    },
    points_earned: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    points_possible: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    letter_grade: {
      type: DataTypes.STRING(2)
    },
    graded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    graded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    feedback: {
      type: DataTypes.TEXT
    },
    feedback_ar: {
      type: DataTypes.TEXT
    },
    is_extra_credit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    weight: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.0,
      validate: {
        min: 0,
        max: 2.0
      }
    },
    is_dropped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'grades',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['assignment_id']
      },
      {
        fields: ['exam_id']
      },
      {
        fields: ['grade_type']
      },
      {
        fields: ['graded_by']
      },
      {
        fields: ['graded_at']
      }
    ]
  });

  Grade.associate = function(models) {
    Grade.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'student'
    });
    Grade.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Grade.belongsTo(models.Assignment, {
      foreignKey: 'assignment_id',
      as: 'assignment'
    });
    Grade.belongsTo(models.Exam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    Grade.belongsTo(models.User, {
      foreignKey: 'graded_by',
      as: 'grader'
    });
  };

  return Grade;
};