
export default (sequelize, DataTypes) => {
  const tempo_index_divisions_group = sequelize.define('tempo_index_divisions_group', {
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: {
        args: false,
        msg: 'The attribute group_id is missing',
      }
    },
    division_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_index_divisions_item',
        key: 'id',
        as: 'division_id',
      }
    },
  }, {});
  tempo_index_divisions_group.associate = (models) => {
    // associations can be defined here
    tempo_index_divisions_group.belongsTo(models.tempo_index_divisions_item, {
      foreignKey: 'division_id',
    });
  };
  return tempo_index_divisions_group;
};