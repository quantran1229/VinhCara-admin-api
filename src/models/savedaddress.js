'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static TYPE = {
      HOME: 1,
      OFFICE: 2
    }

    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }

    static associate(models) {
      // define association here
      SavedAddress.belongsTo(models.Customer, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'customerInfo',
      })
      SavedAddress.belongsTo(models.Location, {
        foreignKey: 'providenceId',
        targetKey: 'id',
        as: 'providenceInfo',
        scope:{
          type: models.Location.TYPE.PROVIDENCE
        }
      })
      SavedAddress.belongsTo(models.Location, {
        foreignKey: 'cityId',
        targetKey: 'id',
        as: 'cityInfo',
        scope:{
          type: models.Location.TYPE.CITY
        }
      })
      SavedAddress.belongsTo(models.Location, {
        foreignKey: 'districtId',
        targetKey: 'id',
        as: 'districtInfo',
        scope:{
          type: models.Location.TYPE.DISTRICT
        }
      })
    }
  };
  SavedAddress.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    recieverName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    phone: DataTypes.INTEGER,
    cityId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    isDefault: DataTypes.BOOLEAN,
    districtId: DataTypes.INTEGER,
    providenceId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    meta: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'SavedAddress',
    tableName: 'saveAddresses',
  });
  return SavedAddress;
};