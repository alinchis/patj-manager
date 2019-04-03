
export default (sequelize, DataTypes) => {
  const tempo_chapter = sequelize.define('tempo_chapter', {
    parent_code: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_chapter',
        key: 'code',
        as: 'parent_code',
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: {
        args: false,
        msg: 'The attributes level is missing',
      }
    },
    index: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute index is missing',
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name is missing',
      }
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: {
        args: false,
        msg: 'The attribute code is missing',
      }
    },
    childrenUrl: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute childrenUrl is missing',
      }
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute comment is missing',
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute url is missing',
      }
    },
  }, {});
  tempo_chapter.associate = (models) => {
    // associations can be defined here
    tempo_chapter.belongsTo(models.tempo_chapter, {
      foreignKey: 'parent_code',
    });
  };
  return tempo_chapter;
};