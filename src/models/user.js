'use strict';
const {
  user
} = require('pg/lib/defaults');
const {
  Model,
  Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static getInfo(value) {
      let condition = {
        [Op.or]: [{
          phone: value
        }, {
          email: value
        }]
      };
      return this.findOne({
        where: condition
      })
    }

    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static associate(models) {
      // define association here
      User.belongsTo(models.UserType, {
        foreignKey: 'userType',
        as: 'typeInfo'
      })
    }
  };
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.INTEGER,
    userType: DataTypes.INTEGER,
    permission: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    permission: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    scopes: {
      active: {
        where: {
          status: User.STATUS.ACTIVE
        }
      },
      noPassword: {
        attribute: {
          exclude: ['password']
        }
      }
    }
  });
  return User;
};