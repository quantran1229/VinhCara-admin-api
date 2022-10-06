'use strict';
const {
  Model
} = require('sequelize');
import {
  Op,
  Sequelize
} from 'sequelize';
import {
  v4 as uuid
} from 'uuid';
module.exports = (sequelize, DataTypes) => {
  class CartSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async getOne(sessionId, userId, withCartItems) {
      let include = [];
      if (withCartItems) {
        include = [{
          model: sequelize.models.CartItem,
          as: 'items'
        }]
      }

      let cart = await this.findOrCreate({
        defaults: {
          id: uuid(),
          sessionId: sessionId ? sessionId : null,
          userId: userId
        },
        where: {
          [Op.or]: [sessionId ? {
            sessionId: sessionId,
            userId: {
              [Op.is]: null
            }
          } : null, userId ? {
            userId: userId
          } : null]
        },
        include: include,
        order: [
          ['userId', 'ASC NULLS LAST']
        ]
      });
      // CASE new cart is created, and user has same sessionId => remove all sessuonId of user with same sessionId
      if (!userId && sessionId && cart[1] == true) {
        await sequelize.models.CartSession.update({
          sessionId: null
        }, {
          where: {
            sessionId: sessionId,
            userId: {
              [Op.not]: null
            }
          }
        })
      }

      // CASE current cart has different sessionId
      if (cart[0].userId && cart[0].sessionId != sessionId && sessionId) {
        // clear all session
        await Promise.all([cart[0].update({ // update current session
          sessionId: sessionId
        }), sequelize.models.CartSession.destroy({ // remove all cart with same session + no user
          where: {
            sessionId: sessionId,
            userId: {
              [Op.eq]: null
            }
          }
        }), sequelize.models.CartSession.update({ // update all cart wutg different
          sessionId: null
        }, {
          where: {
            sessionId: sessionId,
            userId: {
              [Op.and]: [
                {[Op.not]: null},
                {[Op.not]: userId}
              ]
            }
          }
        })]);
        cart[0].sessionId = sessionId;
      } else
      if (sessionId && !cart[0].userId && userId) { // Case cart with same session is found but no user is found => update userId => cart(this is when new user is created)
        await cart[0].update({
          userId: userId
        });
        cart[0].userId = userId;
      }
      return cart[0];
    }

    static async getCartItems(id, userId) {
      let includeWishList = [];
      let currentTotalCost = 0;
      let currentTotalDiscount = 0;
      if (userId) {
        includeWishList = [{
          model: sequelize.models.WishlistLog,
          required: false,
          where: {
            customerId: userId,
            isCurrent: true,
            status: sequelize.models.WishlistLog.STATUS.LIKE,
          },
          as: 'wishlistInfo',
          attributes: [
            ['status', 'isLiked']
          ]
        }]
      }
      let items = await sequelize.models.CartItem.findAll({
        where: {
          cartId: id,
          parentId: null
        },
        include: [{
          model: sequelize.models.CartItem,
          required: false,
          as: 'withDiamond',
        }],
        order: [
          ['updatedAt', 'DESC']
        ]
      });
      let jewList = [];
      let diaList = [];
      for (let item of items) {
        if (item.type == sequelize.models.CartItem.TYPE.JEWELLERY) {
          jewList.push(item.productId);
          if (item.withDiamond && item.withDiamond.length > 0) {
            diaList = diaList.concat(item.withDiamond.map(e => e.productId));
          }
        } else diaList.push(item.productId);
      }
      let promiseAll = await Promise.all([jewList.length > 0 ? sequelize.models.Jewellery.findAll({
          where: {
            productCode: {
              [Op.in]: jewList
            }
          },
          attributes: [
            ['productCode', 'id'], 'productCode', 'mediafiles', 'productName', 'mainCategory', 'type', 'price', 'slug'
          ],
          include: [{
            model: sequelize.models.JewellerySerial,
            required: false,
            as: 'serialList',
            attributes: ['size', 'price', 'type', 'odooUpdatedAt'],
          }, {
            model: sequelize.models.JewelleryCategory,
            as: 'sizeInfo',
            required: false,
            attributes: ['name', 'size', 'defaultSize'],
            include: [{
              model: sequelize.models.JewelleryCategory,
              required: false,
              as: 'subs',
              attributes: ['name', 'size', 'defaultSize'],
            }]
          }].concat(includeWishList),
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
        }) : [],
        diaList.length > 0 ? sequelize.models.DiamondSerial.findAll({
          where: {
            serial: {
              [Op.in]: diaList
            }
          },
          attributes: [
            ['serial', 'id'], 'serial', 'shape', 'size', 'caraWeight', 'color', 'clarity', 'cut', 'price', 'GIAReportNumber'
          ],
          include: [{
            model: sequelize.models.Diamond,
            as: 'generalInfo',
            attributes: ['productCode', 'productName', 'mediafiles']
          }].concat(includeWishList)
        }) : []
      ]);
      let jewllery = promiseAll[0];
      let diamonds = promiseAll[1];
      for (let item of items) {
        if (item.type == sequelize.models.CartItem.TYPE.JEWELLERY) {
          item.dataValues.jewelleryInfo = jewllery.find(e => e.productCode == item.productId);
          if (item.dataValues.jewelleryInfo) {
            let sizeList = [];
            let customizeSize = [];
            switch (item.dataValues.jewelleryInfo.type) {
              case sequelize.models.Jewellery.TYPE.SINGLE:
                // Single only show info of serial that has 
                item.dataValues.jewelleryInfo.dataValues.singleInfo = {
                  serialList: jewellery.serialList,
                }
                currentTotalCost += jewellery.serialList && jewellery.serialList[0] ? parseInt(jewellery.serialList[0].price) * item.quantity : 0;
                // Hide serialList
                item.dataValues.jewelleryInfo.dataValues.serialList = undefined;
                break;
              case sequelize.models.Jewellery.TYPE.DOUBLE:
                let name = item.gender == sequelize.models.CartItem.GENDER.MALE ? 'Nhẫn cưới nam' : 'Nhẫn cưới nữ';
                let serialList = item.dataValues.jewelleryInfo.dataValues.serialList.filter(e => e.gender == item.gender);
                sizeList = [...new Set(((item.dataValues.jewelleryInfo.dataValues.sizeInfo.dataValues.subs.find(e => e.name == name) || {
                  dataValues: {}
                }).dataValues.size || []).concat(maleSerial.map(e => e.size)))].sort((a, b) => {
                  if (!isNaN(a) && !isNaN(b)) {
                    return parseInt(a) - parseInt(b)
                  } else return a - b;
                });
                customizeSize = [];
                for (let size of sizeList) {
                  serialList = serialList.filter(e => e.size == size);
                  customizeSize.push({
                    size: size,
                    isDefault: size == item.size,
                    serialList: serialList,
                  });
                  currentTotalCost += size == item.size && serialList && serialList[0] ? parseInt(serialList[0].price) * item.quantity : 0;
                }
                item.dataValues.jewelleryInfo.dataValues.customizeSizeInfo = customizeSize;
                // Hide serialList
                item.dataValues.jewelleryInfo.dataValues.serialList = undefined;
                // Hide serialList
                break;
              case sequelize.models.Jewellery.TYPE.CUSTOMIZE_SIZE:
                // Show size
                sizeList = [...new Set((item.dataValues.jewelleryInfo.sizeInfo.dataValues.size || []).concat(item.dataValues.jewelleryInfo.serialList.map(e => e.size)))].sort((a, b) => {
                  if (!isNaN(a) && !isNaN(b)) {
                    return parseInt(a) - parseInt(b)
                  } else return a - b;
                });
                customizeSize = [];
                for (let size of sizeList) {
                  let serialList = item.dataValues.jewelleryInfo.serialList.filter(e => e.size == size);
                  customizeSize.push({
                    size: size,
                    isDefault: size == item.size,
                    serialList: serialList,
                  });
                  currentTotalCost += size == item.size && serialList && serialList[0] ? parseInt(serialList[0].price) * item.quantity : 0;
                }
                item.dataValues.jewelleryInfo.dataValues.customizeSizeInfo = customizeSize;
                // Hide serialList
                item.dataValues.jewelleryInfo.dataValues.serialList = undefined;
                break;
            }
            // get with diamond info
            if (item.withDiamond && item.withDiamond.length > 0) {
              for (let diamond of item.withDiamond) {
                let diamondInfo = diamonds.find(e => e.serial == diamond.productId);
                diamond.dataValues.diamondInfo = diamondInfo;
                currentTotalCost += diamondInfo ? parseInt(diamondInfo.price) : 0;
              }
            }
          }
        } else {
          // get diamond info
          item.dataValues.diamondInfo = diamonds.find(e => e.serial == item.productId);
          currentTotalCost += item.dataValues.diamondInfo ? parseInt(item.dataValues.diamondInfo.price) : 0;
        };
      }
      return {
        items,
        currentTotalCost,
        currentTotalDiscount
      };
    }
    static associate(models) {
      // define association here
      CartSession.belongsTo(models.Customer, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'customerInfo'
      });
      CartSession.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        sourceKey: 'id',
        as: 'items'
      });
    }
  };
  CartSession.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    userId: DataTypes.INTEGER,
    sessionId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CartSession',
    tableName: 'cartSessions'
  });
  return CartSession;
};