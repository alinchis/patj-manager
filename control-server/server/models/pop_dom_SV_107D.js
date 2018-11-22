'use strict';

export default (sequelize, DataTypes) => {
  const pop_dom_SV_107D = sequelize.define('pop_dom_SV_107D', {
    code_siruta: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute code_siruta is missing'
      }
    },
    u_admin: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute u_admin is missing'
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: {
        args: false,
        msg: 'Attribute name_en is missing'
      }
    },
    y1992: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1993: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1994: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1995: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1996: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1997: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1998: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y1999: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2000: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2001: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2002: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2003: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2004: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2005: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2006: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2007: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2008: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2009: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2010: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2011: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2012: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2013: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2014: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2015: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2016: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2017: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    y2018: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {});
  pop_dom_SV_107D.associate = (models) => {
    // associations can be defined here
    pop_dom_SV_107D.belongsTo(models.RO_SIRUTA_locality, {
      foreignKey: 'code_siruta'
    });
  };
  return pop_dom_SV_107D;
};