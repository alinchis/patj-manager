
export default (sequelize, DataTypes) => {
  const tempo_index_divisions_item = sequelize.define('tempo_index_divisions_item', {
    name: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name is missing',
      }
    },
  }, {});
  tempo_index_divisions_item.associate = (models) => {
    // associations can be defined here
  };
  return tempo_index_divisions_item;
};