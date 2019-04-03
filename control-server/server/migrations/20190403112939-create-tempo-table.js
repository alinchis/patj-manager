'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tempo_tables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      parent_id: {
        type: Sequelize.INTEGER
      },
      table_code: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      definition: {
        type: Sequelize.STRING
      },
      periodicity: {
        type: Sequelize.STRING
      },
      data_source: {
        type: Sequelize.STRING
      },
      last_update: {
        type: Sequelize.DATEONLY
      },
      observations: {
        type: Sequelize.STRING
      },
      old_table_id: {
        type: Sequelize.STRING
      },
      new_table_id: {
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
    return queryInterface.dropTable('tempo_tables');
  }
};