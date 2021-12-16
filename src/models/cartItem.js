'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static TYPE = {
      JEWELLERY: 1,
      DIAMOND: 2
    }
    static GENDER = {
      MALE: 1,
      FEMALE: 2
    }
    static associate(models) {
      // define association here
      CartItem.hasMany(models.CartItem, {
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'withDiamond'
      });
      CartItem.belongsTo(models.CartItem, {
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parentInfo'
      });
      CartItem.belongsTo(models.Jewellery, {
        foreignKey: 'productId',
        target: 'productCode',
        as: 'jewelleryInfo'
      });
      CartItem.belongsTo(models.DiamondSerial, {
        foreignKey: 'productId',
        target: 'serial',
        as: 'diamondInfo'
      });
    }
  };
  CartItem.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    cartId: DataTypes.UUID,
    gender: DataTypes.INTEGER,
    productId: DataTypes.STRING,
    size: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    lettering: DataTypes.STRING,
    type: DataTypes.INTEGER,
    parentId: DataTypes.UUID,
    meta: DataTypes.JSONB,
    itemInfo: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cartItems'
  });
  return CartItem;
};