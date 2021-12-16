'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BlogType extends Model {
        static associate(models) {
            // define association here
            BlogType.hasMany(models.Blog, {
                foreignKey: 'type',
                sourceKey: 'id',
                as: 'blogs'
            })
        }
    };
    BlogType.init({
        name: DataTypes.STRING,
        slug: DataTypes.STRING
    }, {
        sequelize,
        tableName: 'blogTypes',
        modelName: 'BlogType',
        timestamps: false,
    });
    return BlogType
}