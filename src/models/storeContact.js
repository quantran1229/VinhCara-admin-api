'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class StoreContact extends Model {
        static STATUS = {
            ACTIVE: 1,
            INACTIVE: -1
        }

        static associate(models) {
            // define association here
            StoreContact.belongsTo(models.Stock, {
                foreignKey: 'stockId',
                targetKey: 'id',
                as: 'stockInfo'
            })
            StoreContact.belongsTo(models.Location, {
                foreignKey: 'providenceId',
                targetKey: 'id',
                as: 'providenceInfo',
                scope: {
                    type: models.Location.TYPE.PROVIDENCE
                }
            })
            StoreContact.belongsTo(models.Location, {
                foreignKey: 'cityId',
                targetKey: 'id',
                as: 'cityInfo',
                scope: {
                    type: models.Location.TYPE.CITY
                }
            })
            StoreContact.belongsTo(models.Location, {
                foreignKey: 'districtId',
                targetKey: 'id',
                as: 'districtInfo',
                scope: {
                    type: models.Location.TYPE.DISTRICT
                }
            })
        }
    };
    StoreContact.init({
        name: DataTypes.STRING,
        openTime: DataTypes.JSONB,
        phone: DataTypes.ARRAY(DataTypes.STRING),
        stockId: DataTypes.INTEGER,
        providenceId: DataTypes.INTEGER,
        districtId: DataTypes.INTEGER,
        address: DataTypes.STRING,
        status: DataTypes.INTEGER,
        meta: DataTypes.JSONB,
        mediafiles: DataTypes.JSONB,
        cityId: DataTypes.INTEGER,
        directionLink: DataTypes.STRING
    }, {
        sequelize,
        tableName: 'storeContacts',
        modelName: 'StoreContact',
        timestamps: true,
        defaultScope: {
            where: {
                status: StoreContact.STATUS.ACTIVE
            }
        }
    });
    return StoreContact
}