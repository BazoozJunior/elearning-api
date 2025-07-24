module.exports = (sequelize, DataTypes) => {
  const University = sequelize.define('University', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    name_ar: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUppercase: true,
        len: [2, 10]
      }
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUrl: true
      }
    },
    logo_url: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    description_ar: {
      type: DataTypes.TEXT
    },
    address: {
      type: DataTypes.TEXT
    },
    address_ar: {
      type: DataTypes.TEXT
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    established_year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    subscription_plan: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
      defaultValue: 'basic'
    },
    subscription_expires_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'universities',
    indexes: [
      {
        fields: ['code']
      },
      {
        fields: ['domain']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  University.associate = function(models) {
    University.hasMany(models.Faculty, {
      foreignKey: 'university_id',
      as: 'faculties'
    });
    University.hasMany(models.User, {
      foreignKey: 'university_id',
      as: 'users'
    });
    University.hasMany(models.Course, {
      foreignKey: 'university_id',
      as: 'courses'
    });
    University.hasMany(models.Announcement, {
      foreignKey: 'university_id',
      as: 'announcements'
    });
  };

  return University;
};