'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NewJewellery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  NewJewellery.init({
    productCode: {
      primaryKey:true,
      type: DataTypes.STRING
    },
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'NewJewellery',
    tableName: 'newProducts',
    timestamps: false,
    defaultScope: {
      order: [['order','ASC']]
    }
  });
  return NewJewellery;
};