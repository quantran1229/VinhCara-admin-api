'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  };
  Membership.init({
    name: DataTypes.STRING,
    point: DataTypes.INTEGER,
    percentDiscount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: false
  });
  return Membership;
};