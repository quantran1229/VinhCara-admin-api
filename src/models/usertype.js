'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static associate(models) {
      // define association here
      UserType.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'createdByInfo'
      })
    }
  };
  UserType.init({
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    status: DataTypes.INTEGER,
    meta: DataTypes.JSONB,
    permission: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserType',
    tableName: 'userTypes',
    scopes: {
      active: {
        where: {
          status: UserType.STATUS.ACTIVE
        }
      }
    }
  });
  return UserType;
};