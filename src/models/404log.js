'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotFoundLog extends Model {
    static associate(models) {
    }
  };
  NotFoundLog.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    link: DataTypes.STRING
  }, {
    sequelize,
    tableName: '404Logs',
    modelName: 'NotFoundLog'
  });
  return NotFoundLog;
};