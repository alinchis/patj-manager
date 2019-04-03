
export default (sequelize, DataTypes) => {
  const tempo_table = sequelize.define('tempo_table', {
    parent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_chapter',
        key: 'id',
        as: 'parent_id',
      }
    },
    table_code: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute table_code is missing',
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name is missing',
      }
    },
    definition: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute definition is missing',
      }
    },
    periodicity: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute periodicity is missing',
      }
    },
    data_source: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute data_source is missing',
      }
    },
    last_update: {
      type: DataTypes.DATEONLY,
      allowNull: {
        args: false,
        msg: 'The attribute last_update is missing',
      }
    },
    observations: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute observations is missing',
      }
    },
    old_table_id: DataTypes.STRING,
    new_table_id: DataTypes.STRING,
  }, {});
  tempo_table.associate = (models) => {
    // associations can be defined here
    tempo_table.belongsTo(models.tempo_chapter, {
      foreignKey: 'parent_id',
    })
  };
  return tempo_table;
};