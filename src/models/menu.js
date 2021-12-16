import {
  Model
} from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static STATUS = {
      ACTIVE: 1,
      INACTIVE: -1
    }
    static associate(models) {
      // define association here
      Menu.hasMany(Menu,{
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'subs'
      });

      Menu.belongsTo(Menu,{
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parent'
      });
    }
  };
  Menu.init({
    link: DataTypes.STRING,
    meta: DataTypes.JSONB,
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    bannerInfo: DataTypes.JSONB,
    parentId: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Menu',
    tableName: 'menu',
    timestamps: false,
    defaultScope: {
      where: {
        status: Menu.STATUS.ACTIVE
      }
    }
  });
  return Menu;
};