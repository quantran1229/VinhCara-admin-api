'use strict';
import bcrypt from 'bcrypt';
import Constant from '../constants';
import dayjs from 'dayjs';
const {
  Model,
  Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1,
      BANNED: -2
    }

    static GENDER = {
      MALE: 1,
      FEMALE: 2
    }

    static MARITALSTATUS = {
      SINGLE: 1,
      MARRIED: 2
    }

    static getInfo(value) {
      let condition = {
        [Op.or]: [{
          phone: value
        }, {
          email: value
        }, {
          code: value
        }]
      };
      return this.findOne({
        where: condition
      })
    }

    static associate(models) {
      // define association here
      Customer.hasMany(models.SavedAddress, {
        foreignKey: 'userId',
        sourceKey: 'id',
        as: 'addresses',
        scope: {
          status: models.SavedAddress.STATUS.ACTIVE,
        },
      });
      Customer.hasMany(models.ReturnForm, {
        foreignKey: 'customerId',
        sourceKey: 'id',
        as: 'returnForms',
      });
      Customer.hasMany(models.Order, {
        foreignKey: 'customerId',
        sourceKey: 'id',
        as: 'orders',
      });
      Customer.hasOne(models.SavedAddress, {
        foreignKey: 'userId',
        sourceKey: 'id',
        as: 'defaultAddress',
        scope: {
          status: models.SavedAddress.STATUS.ACTIVE,
          isDefault: true,
        }
      });
    }
  };
  Customer.init({
    code: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    dob: DataTypes.DATE,
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    maritalStatus: {
      type: DataTypes.INTEGER,
      values: [Customer.MARITALSTATUS.MARRIED, Customer.MARITALSTATUS.SINGLE]
    },
    gender: {
      type: DataTypes.INTEGER,
      values: [Customer.GENDER.MALE, Customer.GENDER.FEMALE]
    },
    status: {
      type: DataTypes.INTEGER,
      values: [Customer.STATUS.ACTIVE, Customer.STATUS.INACTIVE]
    },
    avatar: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    scopes: {
      noPassword: {
        attributes: {
          exclude: ['password']
        }
      },
      active: {
        where: {
          status: Customer.STATUS.ACTIVE
        }
      }
    }
  });
  return Customer;
};