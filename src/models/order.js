'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static SHIPPING_TYPE = {
      IN_STORE: 1,
      SHIP: 2
    }
    static PAYMENT_METHOD = {
      ONLINE: 1,
      BANK_DEPOSIT: 2,
      COD: 3,
      PHONE: 4
    }
    static STATUS = {
      NEW: 1,
      PROCESSING: 2,
      SHIPPING: 3,
      DONE: 4,
      ERROR_ON_ODOO: -2,
      CANCEL: -3,
      RETURNED: -4
    }
    static PAYMENT_STATUS = {
      WAITING: 1,
      PAID: 2,
      RETURNED: -2
    }
    static associate(models) {
      // define association here
      Order.belongsTo(models.Location, {
        foreignKey: 'providenceId',
        targetKey: 'id',
        as: 'providenceInfo',
        scope: {
          type: models.Location.TYPE.PROVIDENCE
        }
      })
      Order.belongsTo(models.Location, {
        foreignKey: 'cityId',
        targetKey: 'id',
        as: 'cityInfo',
        scope: {
          type: models.Location.TYPE.CITY
        }
      })
      Order.belongsTo(models.Location, {
        foreignKey: 'districtId',
        targetKey: 'id',
        as: 'districtInfo',
        scope: {
          type: models.Location.TYPE.DISTRICT
        }
      })
      Order.belongsTo(models.Location, {
        foreignKey: 'giftProvidenceId',
        targetKey: 'id',
        as: 'giftProvidenceInfo',
        scope: {
          type: models.Location.TYPE.PROVIDENCE
        }
      })
      Order.belongsTo(models.Location, {
        foreignKey: 'giftCityId',
        targetKey: 'id',
        as: 'giftCityInfo',
        scope: {
          type: models.Location.TYPE.CITY
        }
      })
      Order.belongsTo(models.Location, {
        foreignKey: 'giftDistrictId',
        targetKey: 'id',
        as: 'giftDistrictInfo',
        scope: {
          type: models.Location.TYPE.DISTRICT
        }
      })
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        targetKey: 'id',
        as: 'customerInfo',
      })
      Order.belongsTo(models.Membership, {
        foreignKey: 'membershipCouponId',
        targetKey: 'id',
        as: 'membershipCouponInfo',
      })
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        sourceKey: 'id',
        as: 'items',
      })
      Order.hasMany(models.ReturnForm, {
        foreignKey: 'orderId',
        sourceKey: 'id',
        as: 'returnForms',
      })
    }
  };
  Order.init({
    code: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    totalCost: DataTypes.BIGINT,
    totalDiscount: DataTypes.BIGINT,
    totalPrice: DataTypes.BIGINT,
    couponId: DataTypes.INTEGER,
    membershipCouponId: DataTypes.INTEGER,
    logs: DataTypes.JSONB,
    recieverName: DataTypes.STRING,
    address: DataTypes.STRING,
    districtId: DataTypes.INTEGER,
    cityId: DataTypes.INTEGER,
    providenceId: DataTypes.INTEGER,
    phone: DataTypes.STRING,
    isGift: DataTypes.BOOLEAN,
    giftRecieverName: DataTypes.STRING,
    giftPhone: DataTypes.STRING,
    giftAddress: DataTypes.STRING,
    giftDistrictId: DataTypes.INTEGER,
    giftCityId: DataTypes.INTEGER,
    giftProvidenceId: DataTypes.INTEGER,
    shippingType: DataTypes.INTEGER,
    paymentMethod: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    paymentStatus: DataTypes.INTEGER,
    paymentInfo: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
  });
  return Order;
};