'use strict';

export default (sequelize, DataTypes) => {
  const RO_SIRUTA_locality = sequelize.define('RO_SIRUTA_locality', {
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
    },
    code_postal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    county_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'RO_SIRUTA_county',
        key: 'id',
        as: 'county_id',
      }
    },
    code_siruta_sup: {
      type: DataTypes.STRING,
      references: {
        model: 'RO_SIRUTA_locality',
        key: 'code_siruta',
        as: 'code_siruta_sup',
      }
    },
    code_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_med: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'RO_SIRUTA_region',
        key: 'id',
        as: 'region_id',
      }
    },
    code_fsj: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_fs2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_fs3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_fsl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fictional: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {});
  RO_SIRUTA_locality.associate = (models) => {
    // associations can be defined here
    RO_SIRUTA_locality.belongsTo(models.RO_SIRUTA_county, {
      foreignKey: 'county_id'
    });
    RO_SIRUTA_locality.belongsTo(models.RO_SIRUTA_region, {
      foreignKey: 'region_id'
    });
    RO_SIRUTA_locality.belongsTo(models.pop_dom_SV_107D, {
      foreignKey: 'code_siruta'
    });
  };
  return RO_SIRUTA_locality;
};
