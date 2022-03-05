'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EmailTemplate extends Model {

    };
    EmailTemplate.init({
        body: DataTypes.STRING,
        title: DataTypes.STRING,
    }, {
        sequelize,
        tableName: 'emailTemplates',
        modelName: 'EmailTemplate',
        timestamps: false,
    });
    return EmailTemplate
}