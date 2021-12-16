import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize,
} from 'sequelize';
import {
    v4 as uuid
} from 'uuid';
import db, {
    CartItem,
    CartSession,
    Jewellery,
    DiamondSerial,
    Diamond
} from '../models';

const res = new Response();

export default class CartController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getCartInfo = async (ctx, next) => {
        try {
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null);
            let {
                items,
                currentTotalCost,
                currentTotalDiscount
            } = await CartSession.getCartItems(cart.id, user ? user.id : null);
            cart.dataValues.items = items;
            cart.dataValues.currentTotalCost = currentTotalCost;
            cart.dataValues.currentTotalDiscount = currentTotalDiscount;
            // Return info
            res.setSuccess(cart, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCartInfo ' + e.message + ' ' + e.stack + ' ' + e.errors);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postPutToCart = async (ctx, next) => {
        let transaction;
        try {
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null, true);
            if (!cart.dataValues.items) cart.dataValues.items = [];
            const {
                items
            } = ctx.request.body;
            let errorData = [];
            let jewList = [];
            let diaList = [];
            for (let item of items) {
                if (item.type == CartItem.TYPE.JEWELLERY) {
                    jewList.push(item.productId);
                    if (item.withDiamond)
                        diaList = diaList.concat(item.withDiamond.map(e => e.productId));
                } else diaList.push(item.productId);
            }
            let productsInfo = await Promise.all([Jewellery.findAll({
                    where: {
                        productCode: {
                            [Op.in]: jewList
                        }
                    },
                    attributes: ['productCode', 'productName', 'mainCategory', 'type']
                }),
                DiamondSerial.findAll({
                    where: {
                        serial: {
                            [Op.in]: diaList
                        }
                    },
                    attributes: ['serial', 'shape', 'size', 'caraWeight', 'color', 'clarity', 'cut', 'price', 'GIAReportNumber']
                })
            ])

            // validate product
            for (let i = 0; i < items.length; i++) {
                if (items[i].type == CartItem.TYPE.JEWELLERY) {
                    let findJewellery = productsInfo[0].find(e => e.productCode == items[i].productId);
                    if (!findJewellery) {
                        errorData.push({
                            field: `items[${i}]`,
                            id: i,
                            message: 'not found',
                            code: Constant.instance.ERROR_CODE.CART_JEWELLERY_NOT_FOUND
                        });
                        continue;
                    }
                    if (findJewellery.type == Jewellery.TYPE.DOUBLE) {
                        if (!items[i].gender) {
                            errorData.push({
                                field: `items[${i}].gender`,
                                id: i,
                                message: 'missing field',
                                code: "missing_field"
                            });
                        }
                    }
                    if (findJewellery.type == Jewellery.TYPE.CUSTOMIZE_SIZE || findJewellery.type == Jewellery.TYPE.DOUBLE) {
                        if (!items[i].size) {
                            errorData.push({
                                field: `items[${i}].size`,
                                id: i,
                                message: 'missing field',
                                code: "missing_field"
                            });
                        }
                    }
                    if (items[i].withDiamond) {
                        {
                            for (let d = 0; d < items[i].withDiamond.length; d++) {
                                let diamond = items[i].withDiamond[d];
                                let findDiamond = productsInfo[1].find(e => e.serial == diamond.productId);
                                if (!findDiamond) {
                                    errorData.push({
                                        field: `items[${i}].withDiamond[${d}]`,
                                        id: i,
                                        diamondId: d,
                                        message: 'not found',
                                        code: Constant.instance.ERROR_CODE.CART_DIAMOND_NOT_FOUND
                                    });
                                    continue;
                                }
                                // check if dimond already in cart or not
                                if (cart.dataValues.items.find(e => {
                                        if (e.type == CartItem.TYPE.JEWELLERY) {
                                            if (e.dataValues.withDiamond) {
                                                return e.dataValues.withDiamond.find(x => x.productId == diamond.productId);
                                            }
                                        } else {
                                            return e.productId == diamond.productId;
                                        }
                                        return false
                                    })) {
                                    errorData.push({
                                        field: `items[${i}].withDiamond[${d}]`,
                                        id: i,
                                        diamondId: d,
                                        message: 'duplicate',
                                        code: Constant.instance.ERROR_CODE.CART_DIAMOND_ALREADY_EXIST
                                    });
                                    continue;
                                }
                                // check if diamond in add on info or not
                                for (let j = 0; j < items.length; j++) {
                                    let check = false;
                                    if (items[j].type == CartItem.TYPE.JEWELLERY) {
                                        if (items[j].withDiamond && items[j].withDiamond.length > 0)
                                            check = items[j].withDiamond.find((x, index) => (i != j || index != d) && x.productId == diamond.productId);
                                    } else {
                                        check = diamond.productId == items[j].productId;
                                    }
                                    if (check) {
                                        errorData.push({
                                            field: `items[${i}].withDiamond[${d}]`,
                                            id: i,
                                            message: 'duplicate',
                                            code: Constant.instance.ERROR_CODE.CART_DIAMOND_ALREADY_EXIST
                                        });
                                        break;;
                                    }
                                }
                            };
                        }
                    }
                } else {
                    let findDiamond = productsInfo[1].find(e => e.serial == items[i].productId);
                    if (!findDiamond) {
                        errorData.push({
                            field: `items[${i}]`,
                            id: i,
                            message: 'not found',
                            code: Constant.instance.ERROR_CODE.CART_DIAMOND_NOT_FOUND
                        });
                        continue;
                    }
                    // check if dimond already in cart or not
                    if (cart.dataValues.items.find(e => {
                            if (e.type == CartItem.TYPE.JEWELLERY) {
                                if (e.dataValues.withDiamond) {
                                    return e.dataValues.withDiamond.find(x => x.productId == items[i].productId);
                                }
                            } else {
                                return e.productId == items[i].productId;
                            }
                            return false
                        })) {
                        errorData.push({
                            field: `items[${i}]`,
                            id: i,
                            message: 'duplicate',
                            code: Constant.instance.ERROR_CODE.CART_DIAMOND_ALREADY_EXIST
                        });
                        continue;
                    }
                    // check if diamond in add on info or not
                    for (let j = 0; j < items.length; j++) {
                        if (i == j) continue;
                        let check = false;
                        if (items[j].type == CartItem.TYPE.JEWELLERY) {
                            if (items[j].withDiamond && items[j].withDiamond.length > 0)
                                check = items[j].withDiamond.find(x => x.productId == items[i].productId);
                        } else {
                            check = items[i].productId == items[j].productId;
                        }
                        if (check) {
                            errorData.push({
                                field: `items[${i}]`,
                                id: i,
                                message: 'duplicate',
                                code: Constant.instance.ERROR_CODE.CART_DIAMOND_ALREADY_EXIST
                            });
                            break;;
                        }
                    }
                };
            }
            // stop with error info
            if (errorData.length > 0) {
                res.setError(`Bad request`, Constant.instance.HTTP_CODE.BadRequest, errorData, Constant.instance.ERROR_CODE.CART_BAD_REQUEST);
                return res.send(ctx);
            }
            let results = [];
            transaction = await db.sequelize.transaction();
            for (let item of items) {
                if (item.type == CartItem.TYPE.JEWELLERY) {
                    // check if any jewellery with same info without any diamond
                    if (!item.withDiamond) {
                        let duplicate = cart.dataValues.items.find(e => {
                            return e.productId == item.productId &&
                                e.lettering == item.lettering &&
                                e.size == item.size &&
                                e.type == CartItem.TYPE.JEWELLERY &&
                                !e.withDiamond
                        });
                        if (duplicate) {
                            duplicate = await duplicate.increment('quantity', {
                                by: item.quantity,
                                transaction
                            });
                            results.push(duplicate);
                            continue; // continue to next item
                        }
                    }
                    let saveItem = await CartItem.create({
                        id: uuid(),
                        cartId: cart.id,
                        type: CartItem.TYPE.JEWELLERY,
                        productId: item.productId,
                        lettering: item.lettering,
                        size: item.size,
                        quantity: cart.quantity | 1,
                        gender: item.gender,
                        itemInfo: productsInfo[0].find(e => e.productCode == item.productId)
                    }, {
                        transaction
                    })
                    if (item.withDiamond && item.withDiamond.length > 0) {
                        saveItem.dataValues.withDiamond = [];
                        for (let d of item.withDiamond) {
                            let diamondInfo = await CartItem.create({
                                id: uuid(),
                                cartId: cart.id,
                                parentId: saveItem.id,
                                type: CartItem.TYPE.DIAMOND,
                                productId: d.productId,
                                quantity: 1,
                                itemInfo: productsInfo[1].find(e => e.serial == d.productId)
                            }, {
                                transaction
                            });
                            saveItem.dataValues.withDiamond.push(diamondInfo);
                        }
                    }
                    results.push(saveItem);
                } else {
                    let saveItem = await CartItem.create({
                        id: uuid(),
                        cartId: cart.id,
                        type: CartItem.TYPE.DIAMOND,
                        productId: item.productId,
                        quantity: 1,
                        itemInfo: productsInfo[1].find(e => e.serial == item.productId)
                    }, {
                        transaction
                    });
                    results.push(saveItem);
                }
            }
            if (results.length > 0) {
                await cart.update({
                    updatedAt: new Date()
                }, {
                    silent: true,
                    transaction
                })
            }
            await transaction.commit();
            // Return info
            res.setSuccess(results, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postPutToCart ' + e.message + ' ' + e.stack + ' ' + e.errors);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            if (transaction) {
                await transaction.rollback();
            }
            return res.send(ctx);
        }
    }

    static putUpdateItemInCart = async (ctx, next) => {
        try {
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null, true);
            const id = ctx.request.params.id; // id của cart item
            let cartItem = await CartItem.findOne({
                where: {
                    id: id,
                    cartId: cart.id
                }
            });
            if (!cartItem) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                gender,
                size,
                lettering,
                quantity
            } = ctx.request.body;
            let updateInfo = {}
            if (cartItem.type == CartItem.TYPE.JEWELLERY && gender && cartItem.gender != gender) {
                updateInfo.gender = gender;
            }
            if (cartItem.type == CartItem.TYPE.JEWELLERY && size && cartItem.size != size) {
                updateInfo.size = size;
            }
            if (cartItem.type == CartItem.TYPE.JEWELLERY && lettering && cartItem.lettering != lettering) {
                updateInfo.lettering = lettering;
            }
            if (cartItem.type == CartItem.TYPE.JEWELLERY && quantity && cartItem.quantity != quantity) {
                updateInfo.quantity = quantity;
            }
            cartItem = await cartItem.update(updateInfo);
            // Return list
            res.setSuccess(cartItem, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateItemInCart ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteItemInCart = async (ctx, next) => {
        try {
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null, true);
            const id = ctx.request.params.id; // id của cart item
            let cartItem = await CartItem.findOne({
                where: {
                    id: id,
                    cartId: cart.id
                }
            });
            if (!cartItem) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }

            await cartItem.destroy();
            // Return list
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateItemInCart ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteCart = async (ctx, next) => {
        try {
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null, true);

            await CartItem.destroy({
                where: {
                    cartId: cart.id
                }
            });
            // Return list
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteCart ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}