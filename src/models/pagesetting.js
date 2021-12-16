'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PageSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PageSetting.init({
    name: DataTypes.STRING,
    link: DataTypes.STRING,
    SEOInfo: DataTypes.JSONB,
    setting: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'PageSetting',
    tableName: 'pageSettings',
    timestamps: false
  });
  return PageSetting;
};