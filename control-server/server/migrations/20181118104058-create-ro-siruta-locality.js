'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RO_SIRUTA_localities', {
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
      name_ro: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code_postal: {
        type: Sequelize.STRING
      },
      county_id: {
        type: Sequelize.INTEGER
      },
      code_siruta_sup: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code_type: {
        type: Sequelize.STRING
      },
      code_level: {
        type: Sequelize.STRING
      },
      code_med: {
        type: Sequelize.STRING
      },
      code_med: {
        type: Sequelize.STRING
      },
      region_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      code_fsj: {
        type: Sequelize.STRING
      },
      code_fs2: {
        type: Sequelize.STRING
      },
      code_fs3: {
        type: Sequelize.STRING
      },
      code_fsl: {
        type: Sequelize.STRING
      },
      rank: {
        type: Sequelize.STRING
      },
      fictional: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('RO_SIRUTA_localities');
  }
};
