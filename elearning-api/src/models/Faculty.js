module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
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
      validate: {
        notEmpty: true,
        isUppercase: true,
        len: [2, 10]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    description_ar: {
      type: DataTypes.TEXT
    },
    dean_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    established_year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    }
  }, {
    tableName: 'faculties',
    indexes: [
      {
        fields: ['university_id']
      },
      {
        fields: ['code']
      },
      {
        fields: ['dean_id']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['university_id', 'code']
      }
    ]
  });

  Faculty.associate = function(models) {
    Faculty.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    Faculty.belongsTo(models.User, {
      foreignKey: 'dean_id',
      as: 'dean'
    });
    Faculty.hasMany(models.Department, {
      foreignKey: 'faculty_id',
      as: 'departments'
    });
    Faculty.hasMany(models.Course, {
      foreignKey: 'faculty_id',
      as: 'courses'
    });
  };

  return Faculty;
};