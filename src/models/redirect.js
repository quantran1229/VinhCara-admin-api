'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Redirect extends Model {
    static associate(models) {
    }
  };
  Redirect.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    lastAccessed: DataTypes.TIME
  }, {
    sequelize,
    tableName: 'redirects',
    modelName: 'Redirect',
  });
  return Redirect;
};