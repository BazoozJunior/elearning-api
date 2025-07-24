const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    student_id: {
      type: DataTypes.STRING(20),
      unique: true
    },
    employee_id: {
      type: DataTypes.STRING(20),
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Can be null for SSO users
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    first_name_ar: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 100]
      }
    },
    last_name_ar: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 100]
      }
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    date_of_birth: {
      type: DataTypes.DATEONLY
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.TEXT
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'university_admin', 'dean', 'professor', 'teaching_assistant', 'student'),
      allowNull: false,
      defaultValue: 'student'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING
    },
    reset_password_token: {
      type: DataTypes.STRING
    },
    reset_password_expires: {
      type: DataTypes.DATE
    },
    last_login: {
      type: DataTypes.DATE
    },
    preferred_language: {
      type: DataTypes.ENUM('ar', 'en'),
      defaultValue: 'ar'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    oauth_provider: {
      type: DataTypes.STRING
    },
    oauth_id: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        fields: ['university_id']
      },
      {
        fields: ['email']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['employee_id']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.getFullName = function(language = 'en') {
    if (language === 'ar' && this.first_name_ar && this.last_name_ar) {
      return `${this.first_name_ar} ${this.last_name_ar}`;
    }
    return `${this.first_name} ${this.last_name}`;
  };

  User.associate = function(models) {
    User.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    User.hasMany(models.Enrollment, {
      foreignKey: 'user_id',
      as: 'enrollments'
    });
    User.hasMany(models.Assignment, {
      foreignKey: 'created_by',
      as: 'created_assignments'
    });
    User.hasMany(models.AssignmentSubmission, {
      foreignKey: 'user_id',
      as: 'submissions'
    });
    User.hasMany(models.Grade, {
      foreignKey: 'user_id',
      as: 'grades'
    });
    User.hasMany(models.DiscussionPost, {
      foreignKey: 'user_id',
      as: 'discussion_posts'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  };

  return User;
};