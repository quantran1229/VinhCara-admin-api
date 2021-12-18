'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WishlistLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      LIKE: 1,
      UNLIKE: -1
    }
    static PRODUCT_TYPE = {
      JEWELLERY: 1,
      DIAMOND: 2
    }

    static count = async (id) => {
      let allCountFromDatabase = await Promise.all([
        sequelize.models.Jewellery.count({
          include: [{
            model: this,
            required: true,
            where: {
              customerId: id,
              isCurrent: true,
              status: this.STATUS.LIKE,
            },
            as: 'wishlistInfo'
          }]
        }),
        sequelize.models.DiamondSerial.count({
          include: [{
            model: this,
            required: true,
            where: {
              customerId: id,
              isCurrent: true,
              status: this.STATUS.LIKE,
            },
            as: 'wishlistInfo'
          }]
        })
      ]);
      return allCountFromDatabase[0] + allCountFromDatabase[1];
    }
    static associate(models) {
      // define association here
      WishlistLog.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        targetKey: 'id',
        as: 'customerInfo'
      });
      WishlistLog.belongsTo(models.Jewellery, {
        foreignKey: 'productCode',
        targetKey: 'productCode',
        as: 'jewelleryInfo',
        constraints: false
      });
      WishlistLog.belongsTo(models.DiamondSerial, {
        foreignKey: 'productCode',
        targetKey: 'serial',
        as: 'diamondInfo',
        constraints: false
      });
    }
  };
  WishlistLog.init({
    productCode: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    productType: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    isCurrent: DataTypes.BOOLEAN,
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'WishlistLog',
    tableName: 'wishlistLogs'
  });
  return WishlistLog;
};