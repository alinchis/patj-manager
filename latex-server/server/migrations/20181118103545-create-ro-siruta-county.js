'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RO_SIRUTA_counties', {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_ro: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code_fsj: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      code_auto: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      region_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable('RO_SIRUTA_counties');
  }
};
