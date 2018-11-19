'use strict';

export default (sequelize, DataTypes) => {
  const RO_SIRUTA_region = sequelize.define('RO_SIRUTA_region', {
    code_siruta: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute code_siruta is missing'
      }
    },
    name_ro: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute name_ro is missing'
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute name_en is missing'
      }
    }
  }, {});
  RO_SIRUTA_region.associate = (models) => {
    // associations can be defined here
    RO_SIRUTA_region.hasMany(models.RO_SIRUTA_county, {
      foreignKey: 'region_id',
    });
    RO_SIRUTA_region.hasMany(models.RO_SIRUTA_locality, {
      foreignKey: 'region_id',
    });
  };
  return RO_SIRUTA_region;
};
