'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SEO extends Model {
    static associate(models) {
    }
  };
  SEO.init({
    name: DataTypes.STRING,
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
  }, {
    sequelize,
    tableName: 'SEO',
    modelName: 'SEO',
    timestamps: false
  });
  return SEO;
};