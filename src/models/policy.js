'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Policy extends Model {
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
    }
  };
  Policy.init({
    name: DataTypes.STRING,
    body: DataTypes.TEXT,
    preview: DataTypes.TEXT,
    mediafiles: DataTypes.JSONB,
    slug: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Policy',
    tableName: 'policies',
    timestamps: false,
    defaultScope: {
      where: {
        status: Policy.STATUS.ACTIVE
      }
    }
  });
  return Policy;
};