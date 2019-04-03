
export default (sequelize, DataTypes) => {
  const tempo_header_lvl2 = sequelize.define('tempo_header_lvl2', {
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
    parent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_header_lvl1',
        key: 'id',
        as: 'parent_id',
      }
    }
  }, {});
  tempo_header_lvl2.associate = (models) => {
    // associations can be defined here
    tempo_header_lvl2.belongsTo(models.tempo_header_lvl1, {
      foreignKey: 'parent_id',
    })
  };
  return tempo_header_lvl2;
};