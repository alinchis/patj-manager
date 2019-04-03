
export default (sequelize, DataTypes) => {
  const tempo_mu = sequelize.define('tempo_mu', {
    name: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name is missing',
      }
    },
  }, {});
  tempo_mu.associate = (models) => {
    // associations can be defined here
  };
  return tempo_mu;
};