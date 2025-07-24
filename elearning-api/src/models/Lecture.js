module.exports = (sequelize, DataTypes) => {
  const Lecture = sequelize.define('Lecture', {
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
    content: {
      type: DataTypes.TEXT
    },
    content_ar: {
      type: DataTypes.TEXT
    },
    lecture_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 300
      }
    },
    video_url: {
      type: DataTypes.TEXT
    },
    slides_url: {
      type: DataTypes.TEXT
    },
    notes_url: {
      type: DataTypes.TEXT
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    scheduled_date: {
      type: DataTypes.DATE
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    learning_objectives: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'lectures',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['lecture_number']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['scheduled_date']
      },
      {
        unique: true,
        fields: ['course_id', 'lecture_number']
      }
    ]
  });

  Lecture.associate = function(models) {
    Lecture.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
    Lecture.hasMany(models.LectureView, {
      foreignKey: 'lecture_id',
      as: 'views'
    });
  };

  return Lecture;
};