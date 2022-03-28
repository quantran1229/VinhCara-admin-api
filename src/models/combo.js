'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class combo extends Model {
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
      if (!isNaN(id)) {
        condition.id = id;
      } else {
        condition.link = id;
      }
      return this.findOne({
        where: condition,
        attributes: {
          exclude: check ? null : ['productCode']
        },
      })
    }

    static async getList(condition, pager, orderBy) {
      const result = await this.findAndCountAll(Object.assign({
        where: condition,
        order: orderBy || [
          ['createdAt', 'DESC']
        ],
        attributes: ['id', 'name', 'mediafiles', 'link', 'status', 'createdAt'],
      }, pager));
      return {
        count: result.count,
        list: result.rows
      }
    }
    static associate(models) {
      // define association here
    }
  };
  combo.init({
    link: DataTypes.STRING,
    mediafiles: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    name: DataTypes.STRING,
    productCode: DataTypes.ARRAY(DataTypes.STRING),
    SEOInfo: DataTypes.JSONB,
    status: DataTypes.INTEGER,
    bannerInfo: DataTypes.JSONB,
    createdBy: DataTypes.INTEGER,
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Combo',
    tableName: 'combo',
  });
  return combo;
};