'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class attributeName extends Model {
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
    }
  };
  attributeName.init({
    showName: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AttributeName',
    tableName: 'attributeNames'
  });
  return attributeName;
};