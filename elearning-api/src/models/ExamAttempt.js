module.exports = (sequelize, DataTypes) => {
  const ExamAttempt = sequelize.define('ExamAttempt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    exam_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'exams',
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
    attempt_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    submitted_at: {
      type: DataTypes.DATE
    },
    time_spent_minutes: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'expired'),
      defaultValue: 'in_progress'
    },
    answers: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
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
    is_passed: {
      type: DataTypes.BOOLEAN
    },
    ip_address: {
      type: DataTypes.INET
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    proctoring_data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    violations: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'exam_attempts',
    indexes: [
      {
        fields: ['exam_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['started_at']
      },
      {
        fields: ['submitted_at']
      },
      {
        unique: true,
        fields: ['exam_id', 'user_id', 'attempt_number']
      }
    ]
  });

  ExamAttempt.associate = function(models) {
    ExamAttempt.belongsTo(models.Exam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    ExamAttempt.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ExamAttempt;
};