module.exports = (sequelize, DataTypes) => {
  const LectureView = sequelize.define('LectureView', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    lecture_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lectures',
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
    view_duration_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    completion_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    last_position_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE
    },
    ip_address: {
      type: DataTypes.INET
    },
    user_agent: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'lecture_views',
    indexes: [
      {
        fields: ['lecture_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['is_completed']
      },
      {
        fields: ['created_at']
      },
      {
        unique: true,
        fields: ['lecture_id', 'user_id']
      }
    ]
  });

  LectureView.associate = function(models) {
    LectureView.belongsTo(models.Lecture, {
      foreignKey: 'lecture_id',
      as: 'lecture'
    });
    LectureView.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return LectureView;
};