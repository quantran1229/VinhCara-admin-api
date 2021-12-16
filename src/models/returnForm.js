'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReturnForm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      NEW: 1,
      DONE: 2,
      REJECTED: -1
    }

    static REASON = {
      WRONG_SIZE: 1,
      ITEM_NOT_CORRECT: 2,
      DEFECTIVE_PRODUCT: 3
    }
    static associate(models) {
      // define association here
      ReturnForm.belongsTo(models.Order, {
        foreignKey: 'orderId',
        targetKey: 'id',
        as: 'orderInfo',
      });
      ReturnForm.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        targetKey: 'id',
        as: 'userInfo',
      });
    }
  };
  ReturnForm.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    orderId: DataTypes.INTEGER,
    reason: DataTypes.INTEGER,
    note: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ReturnForm',
    tableName: 'returnForms'
  });
  return ReturnForm;
};