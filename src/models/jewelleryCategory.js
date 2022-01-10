'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JewelleryCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      JewelleryCategory.hasMany(JewelleryCategory, {
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'subs'
      })

      JewelleryCategory.belongsTo(JewelleryCategory, {
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parent'
      })
    }
  };
  JewelleryCategory.init({
    name: DataTypes.STRING,
    parentId: DataTypes.INTEGER,
    size: DataTypes.ARRAY(DataTypes.STRING),
    defaultSize: DataTypes.STRING,
    calculateSize: DataTypes.JSONB
  }, {
    sequelize,
    timestamps: false,
    modelName: 'JewelleryCategory',
    tableName: 'jewelleryCategories'
  });
  return JewelleryCategory;
};