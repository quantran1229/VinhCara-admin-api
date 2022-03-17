'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LuxuryJewellery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static GENDER = {
      MALE: 1,
      FEMALE: 2
    }
    static associate(models) {
      // define association here
      LuxuryJewellery.belongsTo(models.Jewellery.scope('luxury'), {
        foreignKey: 'productCode',
        targetKey: 'productCode',
        as: 'jewelleryInfo'
      })
    }
  };
  LuxuryJewellery.init({
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    gender: DataTypes.INTEGER,
    mediafiles: DataTypes.JSONB,
    blocks: DataTypes.JSONB,
    SEOInfo: DataTypes.JSONB,
    productCode: DataTypes.STRING,
    slug: DataTypes.STRING,
    text: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LuxuryJewellery',
    tableName: 'luxuryJewelleries',
  });
  return LuxuryJewellery;
};