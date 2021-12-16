'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class GeneralInfo extends Model {
        static TYPE = {
            header:2,
            footer:3,
            pageInfo:1
        }
        static getInfo(id = this.TYPE.pageInfo) {
            return this.findOne({
                where: {
                    id: id
                },
                attributes:['id','name','setting']
            })
        }
        static getAll() {
            return this.findAll({
                attributes:['id','name','setting']
            })
        }
    };
    GeneralInfo.init({
        name: DataTypes.STRING,
        setting: DataTypes.JSONB,
    }, {
        sequelize,
        tableName: 'generalInfo',
        modelName: 'GeneralInfo',
        timestamps: true,
    });
    return GeneralInfo
}