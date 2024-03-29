'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Blog extends Model {
        static STATUS = {
            ACTIVE: 2, //publish
            INACTIVE: 1, //Nháp
            STOP: -1 // Dừng
        }
        static associate(models) {
            // define association here
            Blog.belongsTo(models.BlogType, {
                foreignKey: 'type',
                targetKey: 'id',
                as: 'blogTypeInfo'
            })
            Blog.hasMany(models.BlogToTag, {
                foreignKey: 'blogId',
                sourceKey: 'id',
                as: 'listblogToTags'
            })
            Blog.belongsToMany(models.Tag, {
                through: models.BlogToTag,
                as: 'tags',
                foreignKey: 'blogId',
            });
            Blog.belongsTo(models.User, {
                as: 'creatorInfo',
                foreignKey: 'createdBy',
            });
        }
    };
    Blog.init({
        type: DataTypes.INTEGER,
        title: DataTypes.STRING,
        slug: DataTypes.STRING,
        body: DataTypes.STRING,
        status: DataTypes.INTEGER,
        createdBy: DataTypes.INTEGER,
        publishAt: DataTypes.DATE,
        seoInfo: DataTypes.JSONB,
        mediaFiles: DataTypes.JSONB,
        preview: DataTypes.STRING,
        bannerInfo: DataTypes.JSONB
    }, {
        sequelize,
        tableName: 'blogs',
        modelName: 'Blog',
        timestamps: true,
    });
    return Blog
}