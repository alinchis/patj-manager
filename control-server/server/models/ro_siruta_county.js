'use strict';

export default (sequelize, DataTypes) => {
  const RO_SIRUTA_county = sequelize.define('RO_SIRUTA_county', {
    name_ro: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name_ro is missing'
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute name_en is missing'
      }
    },
    code_fsj: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute code_fsj is missing'
      }
    },
    code_auto: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'The attribute code_auto is missing'
      }
    },
    region_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'RO_SIRUTA_region',
        key: 'id',
        as: 'region_id',
      }
    }
  }, {});
  RO_SIRUTA_county.associate = (models) => {
    // associations can be defined here
    RO_SIRUTA_county.belongsTo(models.RO_SIRUTA_region, {
      foreignKey: 'region_id'
    });
  };
  return RO_SIRUTA_county;
};
