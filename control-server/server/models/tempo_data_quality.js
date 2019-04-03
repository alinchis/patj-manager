
export default (sequelize, DataTypes) => {
  const tempo_data_quality = sequelize.define('tempo_data_quality', {
    name: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name is missing',
      }
    }
  }, {});
  tempo_data_quality.associate = function(models) {
    // associations can be defined here
  };
  return tempo_data_quality;
};