module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
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
    instructions: {
      type: DataTypes.TEXT
    },
    instructions_ar: {
      type: DataTypes.TEXT
    },
    exam_type: {
      type: DataTypes.ENUM('quiz', 'midterm', 'final', 'assignment'),
      allowNull: false
    },
    total_points: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 480
      }
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    available_from: {
      type: DataTypes.DATE
    },
    available_until: {
      type: DataTypes.DATE
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shuffle_questions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shuffle_answers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    show_results_immediately: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    allow_review: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    passing_score: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    proctoring_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lockdown_browser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    questions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'exams',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['exam_type']
      },
      {
        fields: ['start_time']
      },
      {
        fields: ['end_time']
      },
      {
        fields: ['is_published']
      }
    ]
  });

  Exam.associate = function(models) {
    Exam.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Exam.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    Exam.hasMany(models.ExamAttempt, {
      foreignKey: 'exam_id',
      as: 'attempts'
    });
  };

  return Exam;
};