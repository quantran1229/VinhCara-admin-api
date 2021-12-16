'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static TYPE = {
      PROVIDENCE: 1,
      CITY: 2,
      DISTRICT: 3
    }
    // Function
    static getFullInfo(id) {
      return this.findOne({
        where: {
          id: id
        },
        include:[{
          model: this,
          as: 'parent',
          attributes:['id','name','type']
        },{
          model: this,
          as: 'subs',
          attributes:['id','name','type']
        }],
        attributes:['id','name','type','meta']
      })
    }

    static associate(models) {
      // define association here
      Location.hasMany(Location,{
        foreignKey: 'parentId',
        sourceKey: 'id',
        as: 'subs'
      });

      Location.belongsTo(Location,{
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parent'
      });
    }
  };
  Location.init({
    name: DataTypes.STRING,
    parentId: DataTypes.INTEGER,
    meta: DataTypes.JSONB,
    type: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'locations',
    modelName: 'Location',
    timestamps: false
  });
  return Location;
};