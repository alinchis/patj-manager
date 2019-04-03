
export default (sequelize, DataTypes) => {
  const tempo_header_lvl1 = sequelize.define('tempo_header_lvl1', {
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
    }
  }, {});
  tempo_header_lvl1.associate = function(models) {
    // associations can be defined here
  };
  return tempo_header_lvl1;
};