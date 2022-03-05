'use strict';
const {
    Model
} = require('sequelize');
import {
    Tag
} from './tag'
import {
    Blog
} from './blog'
module.exports = (sequelize, DataTypes) => {
    class BlogToTag extends Model {
        static associate(models) {
            // define association here
            BlogToTag.belongsTo(models.Tag, {
                foreignKey: 'tagId',
                targetKey: 'id',
                as: 'tagInfo'
            })
            BlogToTag.belongsTo(models.Blog, {
                foreignKey: 'blogId',
                targetKey: 'id',
                as: 'blogInfo'
            })
        }
    };
    BlogToTag.init({
        blogId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        tagId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        }
    }, {
        sequelize,
        tableName: 'blogToTags',
        modelName: 'BlogToTag',
        timestamps: false,
    });
    BlogToTag.removeAttribute('id');
    return BlogToTag
}