'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jewellery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static TYPE = {
      SINGLE: 1, // Đơn, không có size,
      CUSTOMIZE_SIZE: 2, // Tùy biến size
      DOUBLE: 3 // Sản phẩm đôi
    }
    static getInfo(id) {
      let include = [{
        model: sequelize.models.JewellerySerial,
        as: 'serialList',
        required: false
      },
      {
        model: sequelize.models.NewJewellery,
        as: 'newProductInfo',
        attributes: ['order']
    }
    ];
      return this.findOne({
        where: {
          productCode: id
        },
        include: include,
        order: [
          [{
            model: sequelize.models.JewellerySerial,
            as: 'serialList',
          }, 'type', 'ASC'],
          [{
            model: sequelize.models.JewellerySerial,
            as: 'serialList',
          }, 'odooUpdatedAt', 'DESC']
        ]
      })
    }

    static async getList(condition, pager, orderBy, customerId, checkNew) {
      let includeWishlist = null;
      if (customerId) {
        includeWishlist = [{
          model: sequelize.models.WishlistLog,
          required: false,
          where: {
            customerId: customerId,
            isCurrent: true,
            status: sequelize.models.WishlistLog.STATUS.LIKE,
          },
          as: 'wishlistInfo',
          attributes: [
            ['status', 'isLiked']
          ]
        }]
      }
      if (checkNew) {
        if (!includeWishlist) includeWishlist = [];
        includeWishlist.push({
          model: sequelize.models.NewJewellery,
          as: 'newProductInfo',
          required: false,
          attributes: ['order']
        })
      }
      let result = await Promise.all([this.count({
        where: condition
      }), this.findAll(Object.assign({
        where: condition,
        order: orderBy || [
          ['productCode', 'ASC']
        ],
        attributes: [
          ['productCode', 'id'], 'productCode', 'mediafiles', 'productName', 'mainCategory', 'type', 'productCategory', 'price', 'totalViews', 'totalOrders', 'createdAt'
        ],
        include: includeWishlist ? includeWishlist : null
      }, pager))]);
      return {
        count: result[0].count,
        list: result[1]
      }
    }
    static associate(models) {
      // define association here
      Jewellery.hasMany(models.JewellerySerial, {
        foreignKey: 'productOdooId',
        sourceKey: 'productOdooId',
        as: 'serialList'
      });
      Jewellery.hasOne(models.NewJewellery, {
        foreignKey: 'productCode',
        sourceKey: 'productCode',
        as: 'newProductInfo'
      });
      Jewellery.hasOne(models.WishlistLog, {
        foreignKey: 'productCode',
        sourceKey: 'productCode',
        as: 'wishlistInfo',
        constraints: false,
        scope: {
          productType: models.WishlistLog.PRODUCT_TYPE.JEWELLERY
        }
      });
      Jewellery.belongsTo(models.JewelleryCategory, {
        foreignKey: 'mainCategory',
        targetKey: 'name',
        as: 'sizeInfo'
      })

      Jewellery.belongsTo(models.Category, {
        foreignKey: 'mainCategory',
        targetKey: 'name',
        as: 'categoryInfo'
      })
    }
  };
  Jewellery.init({
    productCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    productName: DataTypes.STRING,
    productCategory: DataTypes.ARRAY(DataTypes.STRING),
    productCategorySlug: DataTypes.ARRAY(DataTypes.STRING),
    productOdooId: DataTypes.INTEGER,
    mainCategory: DataTypes.STRING,
    designForm: DataTypes.STRING,
    diamondSize: DataTypes.DOUBLE,
    hasDiamond: DataTypes.INTEGER,
    gemstone: DataTypes.STRING,
    goldProperty: DataTypes.STRING,
    price: DataTypes.INTEGER,
    extraProperties: DataTypes.JSONB,
    mediafiles: DataTypes.JSONB,
    bannerInfo: DataTypes.JSONB,
    SEOInfo: DataTypes.JSONB,
    isLuxury: DataTypes.BOOLEAN,
    keywords: DataTypes.TEXT,
    size: DataTypes.STRING,
    totalViews: DataTypes.INTEGER,
    totalOrders: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    shape: DataTypes.STRING,
    isShowOnWeb: DataTypes.BOOLEAN,
    desc: DataTypes.TEXT,
    isHiddenPrice: DataTypes.BOOLEAN,
    showOnWebTime: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Jewellery',
    tableName: 'jewellery',
    scopes: {
      luxury: {
        where: {
          isLuxury: true
        }
      }
    }
  });
  return Jewellery;
};