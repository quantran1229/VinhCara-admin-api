'use strict';
const {
    Model
} = require('sequelize');
const sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) =>{
    class Stock extends Model {
        static associate(models) {
            // define association here
            Stock.hasMany(models.StoreContact,{
                foreignKey: 'stockId',
                sourceKey: 'id',
                as: 'storeContacts'
            })
        }
    };
    Stock.init({
        name: DataTypes.STRING,
    }, {
        sequelize,
        tableName: 'stocks',
        modelName: 'Stock',
        timestamps: false
    });
    return Stock
}