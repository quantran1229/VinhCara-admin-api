'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }

    static getInfo(id,check) {
      let condition = {}
      if (!isNaN(id)) {
        condition.id = id;
      } else {
        condition.link = id;
      }
      return this.findOne({
        where: condition
      })
    }

    static associate(models) {
      // define association here
    }
  };
  Page.init({
    name: DataTypes.STRING,
    link: DataTypes.STRING,
    SEOInfo: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    bannerInfo: DataTypes.JSONB,
    setting: DataTypes.JSONB,
    blockInfo: DataTypes.JSONB,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Page',
    tableName: 'pages',
    defaultScope: {
      where: {
        status: Page.STATUS.ACTIVE
      }
    }
  });
  return Page;
};