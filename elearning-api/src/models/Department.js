module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'faculties',
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
    head_id: {
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
    degree_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['bachelor']
    }
  }, {
    tableName: 'departments',
    indexes: [
      {
        fields: ['faculty_id']
      },
      {
        fields: ['code']
      },
      {
        fields: ['head_id']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['faculty_id', 'code']
      }
    ]
  });

  Department.associate = function(models) {
    Department.belongsTo(models.Faculty, {
      foreignKey: 'faculty_id',
      as: 'faculty'
    });
    Department.belongsTo(models.User, {
      foreignKey: 'head_id',
      as: 'head'
    });
    Department.hasMany(models.Course, {
      foreignKey: 'department_id',
      as: 'courses'
    });
  };

  return Department;
};