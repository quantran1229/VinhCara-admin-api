'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static TYPE = {
      JEWELLERY: 1,
      DIAMOND: 2
    }
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        targetKey: 'id',
        as: 'orderInfo',
      });
      OrderItem.belongsTo(OrderItem, {
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parentInfo',
      });
      OrderItem.hasMany(models.OrderItem, {
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'withDiamond',
      });
    }
  };
  OrderItem.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    orderId: DataTypes.INTEGER,
    parentId: DataTypes.UUID,
    itemInfo: DataTypes.JSONB,
    serial: DataTypes.STRING,
    price: DataTypes.BIGINT,
    type: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    productCode: DataTypes.STRING,
    size: DataTypes.STRING,
    gender: DataTypes.INTEGER,
    lettering: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'orderItems',
    timestamps: false
  });
  return OrderItem;
};