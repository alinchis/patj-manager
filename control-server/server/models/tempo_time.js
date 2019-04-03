
export default (sequelize, DataTypes) => {
  const tempo_time = sequelize.define('tempo_time', {
    start_time: {
      type: DataTypes.DATEONLY,
      allowNull: {
        args: false,
        msg: 'The attribute start_date is missing',
      }
    },
    end_time: {
      type: DataTypes.DATEONLY,
      allowNull: {
        args: false,
        msg: 'The attribute end_date is missing',
      }
    },
    label: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute label is missing',
      }
    },
  }, {});
  tempo_time.associate = (models) => {
    // associations can be defined here
  };
  return tempo_time;
};