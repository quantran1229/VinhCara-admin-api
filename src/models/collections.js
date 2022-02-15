'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class collections extends Model {
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
      let condition = {
        status: this.STATUS.ACTIVE
      }
      if (!isNaN(id)) 
      {
        condition.id = id;
      }
      else {
        condition.link = id;
      }
      return this.findOne({
        where: condition,
        attributes: {
          include: !check ? [[Sequelize.fn('array_length', Sequelize.col("productCode"), 1), 'totalProduct']] : null,
          exclude: !check ? ['productCode'] : null
        },
      })
    }

    static async getList(condition, pager, orderBy) {
      const result = await this.findAndCountAll(Object.assign({
        where: condition,
        order: orderBy || [
          ['createdAt', 'DESC']
        ],
        attributes: ['id', 'name', 'mediafiles', 'link', [Sequelize.fn('array_length', Sequelize.col("productCode"), 1), 'totalProduct']],
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
  collections.init({
    link: DataTypes.STRING,
    mediafiles: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    name: DataTypes.STRING,
    productCode: DataTypes.ARRAY(DataTypes.STRING),
    SEOInfo: DataTypes.JSONB,
    status: DataTypes.INTEGER,
    bannerInfo: DataTypes.JSONB,
    createdBy: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Collection',
    tableName: 'collections',
    defaultScope: {
      where: {
        status: collections.STATUS.ACTIVE
      }
    }
  });
  return collections;
};