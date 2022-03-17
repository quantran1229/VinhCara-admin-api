'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static TYPE = {
      JEWELLERY: 1,
      DIAMOND: 2
    }
    static associate(models) {
      // define association here
      Category.hasMany(Category,{
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'subs'
      });

      Category.belongsTo(Category,{
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parent'
      });
    }
  };
  Category.init({
    parentId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    desc: DataTypes.TEXT,
    link: DataTypes.STRING,
    mediafiles: DataTypes.JSONB,
    meta: DataTypes.JSONB,
    status: DataTypes.INTEGER,
    type: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false,
  });
  return Category;
};