module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    university_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'universities',
        key: 'id'
      }
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'faculties',
        key: 'id'
      }
    },
    department_id: {
      type: DataTypes.UUID,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 20]
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
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    description_ar: {
      type: DataTypes.TEXT
    },
    credit_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    semester: {
      type: DataTypes.ENUM('fall', 'spring', 'summer'),
      allowNull: false
    },
    academic_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
      validate: {
        is: /^\d{4}-\d{4}$/
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    max_students: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      validate: {
        min: 1,
        max: 500
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    syllabus_url: {
      type: DataTypes.TEXT
    },
    schedule: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    grading_scale: {
      type: DataTypes.JSONB,
      defaultValue: {
        'A': { min: 90, max: 100 },
        'B': { min: 80, max: 89 },
        'C': { min: 70, max: 79 },
        'D': { min: 60, max: 69 },
        'F': { min: 0, max: 59 }
      }
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'courses',
    indexes: [
      {
        fields: ['university_id']
      },
      {
        fields: ['faculty_id']
      },
      {
        fields: ['department_id']
      },
      {
        fields: ['instructor_id']
      },
      {
        fields: ['course_code']
      },
      {
        fields: ['semester', 'academic_year']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_published']
      },
      {
        unique: true,
        fields: ['university_id', 'course_code', 'semester', 'academic_year']
      }
    ]
  });

  Course.associate = function(models) {
    Course.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    Course.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
    Course.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department'
    });
    Course.belongsTo(models.User, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
    Course.hasMany(models.Enrollment, {
      foreignKey: 'course_id',
      as: 'enrollments'
    });
    Course.hasMany(models.Lecture, {
      foreignKey: 'course_id',
      as: 'lectures'
    });
    Course.hasMany(models.Assignment, {
      foreignKey: 'course_id',
      as: 'assignments'
    });
    Course.hasMany(models.Exam, {
      foreignKey: 'course_id',
      as: 'exams'
    });
    Course.hasMany(models.Discussion, {
      foreignKey: 'course_id',
      as: 'discussions'
    });
    Course.hasMany(models.Announcement, {
      foreignKey: 'course_id',
      as: 'announcements'
    });
  };

  return Course;
};