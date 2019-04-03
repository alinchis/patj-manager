
export default (sequelize, DataTypes) => {
  const tempo_index = sequelize.define('tempo_index', {
    table_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_tables',
        key: 'id',
        as: 'table_id',
      }
    },
    geography_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_geography',
        key: 'siruta',
        as: 'geography_id',
      }
    },
    divisions_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_index_divisions_group',
        key: 'group_id',
        as: 'divisions_id',
      }
    },
    time_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_time',
        key: 'id',
        as: 'time_id',
      }
    },
    value: DataTypes.INTEGER,
    mu_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_mu',
        key: 'id',
        as: 'mu_id',
      }
    },
    data_qlty_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tempo_data_quality',
        key: 'id',
        as: 'data_qlty_id',
      }
    },
  }, {});
  tempo_index.associate = (models) => {
    // associations can be defined here
    tempo_index.belongsTo(models.tempo_table, {
      foreignKey: 'table_id',
    });
    tempo_index.belongsTo(models.tempo_geography, {
      foreignKey: 'geography_id',
    });
    tempo_index.belongsTo(models.tempo_index_divisions_group, {
      foreignKey: 'divisions_id',
    });
    tempo_index.belongsTo(models.tempo_time, {
      foreignKey: 'time_id',
    });
    tempo_index.belongsTo(models.tempo_mu, {
      foreignKey: 'mu_id',
    });
    tempo_index.belongsTo(models.tempo_data_quality, {
      foreignKey: 'data_qlty_id',
    });
  };
  return tempo_index;
};