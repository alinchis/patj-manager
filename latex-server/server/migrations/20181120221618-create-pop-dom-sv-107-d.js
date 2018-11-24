'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pop_dom_SV_107Ds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code_siruta: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      u_admin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false
      },
      y1992: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1993: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1994: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1995: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1996: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1997: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1998: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y1999: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2000: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2001: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2002: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2003: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2004: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2005: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2006: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2007: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2008: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2009: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2010: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2011: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2012: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2013: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2014: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2015: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2016: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2017: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      y2018: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('pop_dom_SV_107Ds');
  }
};
