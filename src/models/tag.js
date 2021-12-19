'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsToMany(models.Blog, {
                through: models.BlogToTag,
                as: 'blogs',
                foreignKey: 'tagId'
            })
            Tag.hasMany(models.BlogToTag, {
                foreignKey: 'tagId',
                sourceKey: 'id',
                as: 'listblogToTags'
            })
        }
    };
    Tag.init({
        title: DataTypes.STRING,
        link: DataTypes.STRING,
        desc: DataTypes.STRING,
    }, {
        sequelize,
        tableName: 'tags',
        modelName: 'Tag',
        timestamps: false,
    });
    return Tag
}