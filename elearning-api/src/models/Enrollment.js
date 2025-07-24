module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define('Enrollment', {
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
    status: {
      type: DataTypes.ENUM('enrolled', 'dropped', 'completed', 'failed'),
      defaultValue: 'enrolled'
    },
    enrollment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    final_grade: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    letter_grade: {
      type: DataTypes.STRING(2)
    },
    is_audit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    tableName: 'enrollments',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['status']
      },
      {
        unique: true,
        fields: ['user_id', 'course_id']
      }
    ]
  });

  Enrollment.associate = function(models) {
    Enrollment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Enrollment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
  };

  return Enrollment;
};