
export default (sequelize, DataTypes) => {
  const tempo_geography = sequelize.define('tempo_geography', {
    code_siruta: {
      type: DataTypes.INTEGER,
      allowNull: {
        args: false,
        msg: 'The attribute siruta is missing',
      }
    },
    code_siruta_sup: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_geography',
        key: 'code_siruta',
        as: 'code_siruta_sup',
      }
    },
    name_ro: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name_ro is missing',
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name_en is missing',
      }
    },
  }, {});
  tempo_geography.associate = (models) => {
    // associations can be defined here
    tempo_geography.belongsTo(models.tempo_geography, {
      foreignKey: 'code_siruta',
    });
  };
  return tempo_geography;
};