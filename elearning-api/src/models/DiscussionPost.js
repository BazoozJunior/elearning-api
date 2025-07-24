module.exports = (sequelize, DataTypes) => {
  const DiscussionPost = sequelize.define('DiscussionPost', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    discussion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'discussions',
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
    parent_post_id: {
      type: DataTypes.UUID,
      references: {
        model: 'discussion_posts',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_answer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_endorsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    endorsed_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    endorsed_at: {
      type: DataTypes.DATE
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edited_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'discussion_posts',
    indexes: [
      {
        fields: ['discussion_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['parent_post_id']
      },
      {
        fields: ['is_answer']
      },
      {
        fields: ['is_endorsed']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  DiscussionPost.associate = function(models) {
    DiscussionPost.belongsTo(models.Discussion, {
      foreignKey: 'discussion_id',
      as: 'discussion'
    });
    DiscussionPost.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author'
    });
    DiscussionPost.belongsTo(models.DiscussionPost, {
      foreignKey: 'parent_post_id',
      as: 'parent'
    });
    DiscussionPost.hasMany(models.DiscussionPost, {
      foreignKey: 'parent_post_id',
      as: 'replies'
    });
    DiscussionPost.belongsTo(models.User, {
      foreignKey: 'endorsed_by',
      as: 'endorser'
    });
  };

  return DiscussionPost;
};