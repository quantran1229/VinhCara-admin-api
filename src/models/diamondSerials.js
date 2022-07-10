'use strict';
const {
  Model,
  Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DiamondSerial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static TYPE = {
      REAL: 1,
      FAKE: 2
    }

    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }

    static getInfo(id, customerId) {
      let condition = {
        [Op.or]: [{
          serial: id
        }, {
          GIAReportNumber: id
        }]
      }
      let include = [{
        model: sequelize.models.Diamond,
        as: 'generalInfo',
        attributes: ['productCode', 'productName', 'mediafiles', 'SEOInfo', 'bannerInfo', 'meta']
      }];
      if (customerId) {
        include.push({
          model: sequelize.models.WishlistLog,
          required: false,
          where: {
            customerId: customerId,
            isCurrent: true,
            status: sequelize.models.WishlistLog.STATUS.LIKE,
          },
          as: 'wishlistInfo',
          attributes: [
            ['status', 'isLiked']
          ]
        });
      }
      return this.findOne({
        where: condition,
        include: include
      })
    }


    static async getList(condition, pager, orderBy, customerId) {
      let include = [{
        model: sequelize.models.Diamond,
        as: 'generalInfo',
        attributes: ['productCode', 'productName', 'mediafiles']
      }];
      if (customerId) {
        include.push({
          model: sequelize.models.WishlistLog,
          required: false,
          where: {
            customerId: customerId,
            isCurrent: true,
            status: sequelize.models.WishlistLog.STATUS.LIKE,
          },
          as: 'wishlistInfo',
          attributes: [
            ['status', 'isLiked']
          ]
        });
      }
      const result = await Promise.all([
        this.findAll(Object.assign({
          where: condition,
          order: orderBy || [
            ['size', 'ASC'],
            ['type', 'ASC']
          ],
          attributes: [
            ['serial', 'id'], 'shape', 'size', 'caraWeight', 'color', 'clarity', 'cut', 'price', 'GIAReportNumber', 'type'
          ],
          include: include
        }, pager)),
        this.count({
          where: condition
        })
      ])
      return {
        count: result[1],
        list: result[0]
      }
    }

    static associate(models) {
      // define association here
      DiamondSerial.belongsTo(models.Diamond, {
        foreignKey: 'productOdooId',
        targetKey: 'productOdooId',
        as: 'generalInfo'
      });
      DiamondSerial.belongsTo(models.Stock, {
        foreignKey: 'stockId',
        targetKey: 'id',
        as: 'stockInfo'
      });
    }
  };
  DiamondSerial.init({
    productOdooId: DataTypes.NUMBER,
    caraWeight: DataTypes.DOUBLE,
    clarity: DataTypes.STRING,
    color: DataTypes.STRING,
    cut: DataTypes.STRING,
    price: DataTypes.BIGINT,
    extraProperties: DataTypes.JSONB,
    measurements: DataTypes.STRING,
    price: DataTypes.BIGINT,
    shape: DataTypes.STRING,
    size: DataTypes.DOUBLE,
    type: DataTypes.INTEGER,
    serial: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    GIAReportNumber: DataTypes.STRING,
    stockId: DataTypes.NUMBER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DiamondSerial',
    tableName: 'diamondSerials',
    defaultScope: {
      attributes: {
        include: [
          ['serial', 'id']
        ]
      }
    }
  });
  return DiamondSerial;
};