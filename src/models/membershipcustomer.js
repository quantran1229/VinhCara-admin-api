'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MembershipCustomer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MembershipCustomer.belongsTo(models.Membership,{
        foreignKey: 'type',
        targetKey: 'id',
        as: 'membershipInfo'
      })
    }
  };
  MembershipCustomer.init({
    name: DataTypes.STRING,
    customerCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    type: DataTypes.INTEGER,
    point: DataTypes.INTEGER,
    meta: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'MembershipCustomer',
    tableName: 'membershipCustomers',
    timestamps: false
  });
  return MembershipCustomer;
};