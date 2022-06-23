'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sitemap extends Model {
    static associate(models) {
    }
  };
  Sitemap.init({
    name: DataTypes.STRING,
    sitemap: DataTypes.TEXT,
    urls: DataTypes.JSONB,
    link: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'sitemaps',
    modelName: 'Sitemap'
  });
  return Sitemap;
};