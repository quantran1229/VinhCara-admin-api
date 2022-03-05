'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JewellerySerial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static TYPE = {
      REAL: 1,
      FAKE: 2
    }
    static GENDER = {
      MALE: 1,
      FEMALE: 2
    }
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static associate(models) {
      // define association here
      JewellerySerial.belongsTo(models.Jewellery, {
        foreignKey: 'productOdooId',
        targetKey: 'productOdooId',
        as: 'generalInfo'
      });
      JewellerySerial.belongsTo(models.Stock, {
        foreignKey: 'stockId',
        targetKey: 'id',
        as: 'stockInfo'
      });
    }
  };
  JewellerySerial.init({
    type: DataTypes.INTEGER,
    serial: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    productOdooId: DataTypes.INTEGER,
    stockId: DataTypes.INTEGER,
    diamondSize: DataTypes.DOUBLE,
    gemstone: DataTypes.STRING,
    goldProperty: DataTypes.STRING,
    hasDiamond: DataTypes.INTEGER,
    size: DataTypes.STRING,
    gender: DataTypes.STRING,
    extraProperties: DataTypes.JSONB,
    price: DataTypes.BIGINT,
    odooUpdatedAt: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'JewellerySerial',
    tableName: 'jewellerySerials',
    timestamps: false,
    defaultScope: {
      where: {
        status: JewellerySerial.STATUS.ACTIVE
      },
    }
  });
  return JewellerySerial;
};