'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Diamond extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diamond.hasMany(models.DiamondSerial,{
        foreignKey: 'productOdooId',
        sourceKey: 'productOdooId',
        as: 'serialList'
      });
    }
  };
  Diamond.init({
    productCode:{
      type: DataTypes.STRING,
      primaryKey: true
    },
    productName: DataTypes.STRING,
    productOdooId: DataTypes.INTEGER,
    bannerInfo: DataTypes.JSONB,
    caraWeight: DataTypes.DOUBLE,
    clarity: DataTypes.DOUBLE,
    color: DataTypes.STRING,
    cut: DataTypes.STRING,
    price: DataTypes.INTEGER,
    extraProperties: DataTypes.JSONB,
    keywords: DataTypes.TEXT,
    measurements: DataTypes.STRING,
    mediafiles: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    price: DataTypes.BIGINT,
    shape: DataTypes.STRING,
    size: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Diamond',
    tableName: 'diamonds',
    timestamps: false
  });
  return Diamond;
};