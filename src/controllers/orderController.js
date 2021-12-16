import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    getRandomString,
    paging
} from '../utils/utils';
import {
    v4 as uuid
} from 'uuid';
import dayjs from 'dayjs';
import {
    Op,
    Sequelize
} from 'sequelize';
import db, {
    Order,
    OrderItem,
    Diamond,
    DiamondSerial,
    Jewellery,
    JewellerySerial,
    CartSession,
    CartItem,
    ReturnForm
} from '../models';

const res = new Response();

export default class LocationController {
    // Check health, return memory usage + uptime + mediafile disk size
    static postNewOrder = async (ctx, next) => {
        let transaction;
        try {
            let sessionId = ctx.state.sessionId;
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            let cart = await CartSession.getOne(sessionId, user ? user.id : null, true);
            if (!cart.items || cart.items.length == 0) {
                res.setError(`Error no item in cart`, Constant.instance.HTTP_CODE.BadRequest, null, Constant.instance.ERROR_CODE.ORDER_NO_ITEM_IN_CART);
                return res.send(ctx);
            }
            let subItem = cart.items.filter(e => e.parentId);
            cart.items = cart.items.filter(e => !e.parentId);
            cart.items.forEach(e => {
                e.dataValues.withDiamond = subItem.filter(x => x.parentId == e.id);
            })
            let errorList = [];
            let diaList = [];
            let jewList = [];
            for (let item of cart.items) {
                if (item.type == CartItem.TYPE.JEWELLERY) {
                    jewList.push(item.productId);
                    if (item.dataValues.withDiamond) {
                        diaList = diaList.concat(item.dataValues.withDiamond.map(e => e.productId));
                    }
                } else {
                    diaList.push(item.productId);
                }
            }
            let promiseAll = await Promise.all([jewList.length > 0 ? Jewellery.findAll({
                    where: {
                        productCode: {
                            [Op.in]: jewList
                        }
                    },
                    attributes: [
                        ['productCode', 'id'], 'productCode', 'mediafiles', 'productName', 'mainCategory', 'type', 'price'
                    ],
                    include: [{
                        model: JewellerySerial,
                        required: false,
                        as: 'serialList',
                        attributes: ['serial', 'size', 'price', 'type', 'odooUpdatedAt'],
                    }],
                    order: [
                        [{
                            model: JewellerySerial,
                            as: 'serialList',
                        }, 'type', 'ASC'],
                        [{
                            model: JewellerySerial,
                            as: 'serialList',
                        }, 'odooUpdatedAt', 'DESC']
                    ]
                }) : [],
                diaList.length > 0 ? DiamondSerial.findAll({
                    where: {
                        serial: {
                            [Op.in]: diaList
                        }
                    },
                    attributes: [
                        ['serial', 'id'], 'serial', 'shape', 'size', 'caraWeight', 'color', 'clarity', 'cut', 'price', 'GIAReportNumber'
                    ],
                    include: [{
                        model: Diamond,
                        as: 'generalInfo',
                        attributes: ['productCode', 'productName', 'mediafiles']
                    }]
                }) : []
            ]);
            for (let item of cart.items) {
                if (item.type == CartItem.TYPE.JEWELLERY) {
                    let error = {
                        id: item.id,
                        type: CartItem.TYPE.JEWELLERY,
                        diamondList: []
                    }
                    if (item.dataValues.withDiamond) {
                        for (let diamond of item.dataValues.withDiamond) {
                            let find = promiseAll[1].find(e => e.serial == diamond.productId);
                            if (!find) {
                                error.diamondList.push({
                                    id: diamond.productId,
                                    msg: "No more diamond in stock",
                                    code: Constant.instance.ERROR_CODE.ORDER_NO_DIAMOND_IN_STOCK,
                                    type: CartItem.TYPE.DIAMOND,
                                    info: diamond.itemInfo
                                })
                            }
                        }
                    }
                    if (error.diamondList.length > 0) {
                        errorList.push(error);
                    }
                } else {
                    let find = promiseAll[1].find(e => e.serial == item.productId);
                    if (!find) {
                        errorList.push({
                            id: item.productId,
                            msg: "No more diamond in stock",
                            code: Constant.instance.ERROR_CODE.ORDER_NO_DIAMOND_IN_STOCK,
                            type: CartItem.TYPE.DIAMOND,
                            info: item.itemInfo
                        })
                    }
                }
            }
            if (errorList.length > 0) {
                res.setError("Item not in stock", Constant.instance.HTTP_CODE.BadRequest, errorList, Constant.instance.ERROR_CODE.ORDER_NO_DIAMOND_IN_STOCK);
                return res.send(ctx);
            }

            // TODO: check odoo for serial in stock

            // TODO: VNPay
            // Create new order
            const {
                recieverName,
                address,
                providenceId,
                cityId,
                districtId,
                phone,
                email,
                isGift,
                giftRecieverName,
                giftAddress,
                giftProvidenceId,
                giftCityId,
                giftDistrictId,
                giftPhone,
                shippingType,
                paymentMethod
            } = ctx.request.body;
            // check reciever info + gift info
            if (isGift) {
                if (!giftRecieverName ||
                    !giftAddress ||
                    !giftProvidenceId ||
                    !giftCityId ||
                    !giftDistrictId ||
                    !giftPhone) {
                    let info = [];
                    if (!giftRecieverName) info.push({
                        code: 'missing_field',
                        field: 'giftRecieverName',
                        message: 'required'
                    });
                    if (!giftAddress) info.push({
                        code: 'missing_field',
                        field: 'giftAddress',
                        message: 'required'
                    });
                    if (!giftProvidenceId) info.push({
                        code: 'missing_field',
                        field: 'giftProvidenceId',
                        message: 'required'
                    });
                    if (!giftCityId) info.push({
                        code: 'missing_field',
                        field: 'giftCityId',
                        message: 'required'
                    });
                    if (!giftDistrictId) info.push({
                        code: 'missing_field',
                        field: 'giftDistrictId',
                        message: 'required'
                    });
                    if (!giftPhone) info.push({
                        code: 'missing_field',
                        field: 'giftPhone',
                        message: 'required'
                    });
                    res.setError(`Missing info`, Constant.instance.HTTP_CODE.BadRequest, info);
                    return res.send(ctx);
                }
            }
            if (!recieverName ||
                !address ||
                !providenceId ||
                !cityId ||
                !districtId ||
                !phone) {
                let info = [];
                if (!recieverName) info.push({
                    code: 'missing_field',
                    field: 'recieverName',
                    message: 'required'
                });
                if (!address) info.push({
                    code: 'missing_field',
                    field: 'address',
                    message: 'required'
                });
                if (!providenceId) info.push({
                    code: 'missing_field',
                    field: 'providenceId',
                    message: 'required'
                });
                if (!cityId) info.push({
                    code: 'missing_field',
                    field: 'cityId',
                    message: 'required'
                });
                if (!districtId) info.push({
                    code: 'missing_field',
                    field: 'districtId',
                    message: 'required'
                });
                if (!phone) info.push({
                    code: 'missing_field',
                    field: 'phone',
                    message: 'required'
                });
                res.setError(`Missing info`, Constant.instance.HTTP_CODE.BadRequest, info);
                return res.send(ctx);
            }
            let totalCost = 0;
            let totalDiscount = 0;
            // Calculate price + discount
            let items = [];
            for (let item of cart.items) {
                if (item.type == CartItem.TYPE.JEWELLERY) {
                    let foundJewellery = promiseAll[0].find(e => e.productCode == item.productId);
                    if (foundJewellery) {
                        let itemInfo = {
                            id: foundJewellery.productCode,
                            productCode: foundJewellery.productCode,
                            productName: foundJewellery.productName,
                            mainCategory: foundJewellery.mainCategory,
                            mediafiles: foundJewellery.mediafiles,
                            price: 0,
                            gender: item.gender
                        }
                        let serial = {};
                        switch (foundJewellery.type) {
                            case Jewellery.TYPE.SINGE:
                                serial = foundJewellery.serialList[0];
                                if (serial) {
                                    totalCost += parseInt(serial.price) * item.quantity;
                                    itemInfo.price = parseInt(serial.price)
                                }
                                break;
                            case Jewellery.TYPE.DOUBLE:
                                serial = foundJewellery.serialList.find(e => {
                                    return e.gender == item.gender && e.size == item.size;
                                });
                                if (serial) {
                                    itemInfo.price = parseInt(serial.price)
                                    totalCost += parseInt(serial.price) * item.quantity;
                                }
                                break;
                            case Jewellery.TYPE.CUSTOMIZE_SIZE:
                                serial = foundJewellery.serialList.find(e => {
                                    return e.size == item.size;
                                });
                                if (serial) {
                                    itemInfo.price = parseInt(serial.price)
                                    totalCost += parseInt(serial.price) * item.quantity;
                                }
                                break;
                        }
                        itemInfo.serial = serial;
                        let withDiamond = [];
                        if (item.dataValues.withDiamond) {
                            for (let diamond of item.dataValues.withDiamond) {
                                let foundDiamond = promiseAll[1].find(e => e.serial == diamond.productId);
                                if (foundDiamond) {
                                    withDiamond.push({
                                        serial: foundDiamond.serial,
                                        type: OrderItem.TYPE.DIAMOND,
                                        price: foundDiamond.price,
                                        quantity: 1,
                                        productCode: foundDiamond.generalInfo ? foundDiamond.generalInfo.productCode : '',
                                        itemInfo: foundDiamond
                                    });
                                    // coupon for diamond

                                    // calculate price
                                    totalCost += parseInt(foundDiamond.price);
                                }
                            }
                        }
                        items.push({
                            serial: serial ? serial.serial : null,
                            type: OrderItem.TYPE.JEWELLERY,
                            price: serial ? serial.price : 0,
                            size: item.size,
                            gender: item.gender,
                            quantity: item.quantity,
                            productCode: foundJewellery.productCode,
                            itemInfo: itemInfo,
                            lettering: item.lettering,
                            withDiamond: withDiamond
                        });
                    }
                } else {
                    let foundDiamond = promiseAll[1].find(e => e.serial == item.productId);
                    if (foundDiamond) {
                        items.push({
                            serial: foundDiamond.serial,
                            type: OrderItem.TYPE.DIAMOND,
                            price: foundDiamond.price,
                            quantity: 1,
                            productCode: foundDiamond.diamondInfo ? foundDiamond.diamondInfo.productCode : '',
                            itemInfo: foundDiamond
                        });
                        // coupon for diamond

                        // calculate price
                        totalCost += parseInt(foundDiamond.price);
                    }
                }
            }

            // Put to database
            transaction = await db.sequelize.transaction();
            let code = '';
            let check = true;
            while (check) {
                code = dayjs().format('YYMMDD') + (user ? 1 : 2) + getRandomString(5).toUpperCase();
                check = await Order.findOne({
                    where: {
                        code: code
                    },
                    attributes: ['code']
                })
            }
            let order = await Order.create({
                code,
                customerId: user ? user.id : null,
                recieverName,
                address,
                providenceId,
                cityId,
                districtId,
                phone,
                isGift,
                giftRecieverName,
                giftAddress,
                giftProvidenceId,
                giftCityId,
                giftDistrictId,
                giftPhone,
                shippingType,
                paymentMethod,
                totalCost,
                totalDiscount,
                totalPrice: totalCost - totalDiscount > 0 ? totalCost - totalDiscount : 0,
                logs: [{
                    id: 0,
                    createdAt: dayjs().unix(),
                    status: Order.STATUS.NEW,
                    paymentStatus: Order.PAYMENT_STATUS.WAITING,
                    by: 0
                }],
                paymentInfo: {
                    createdAt: null,
                    info: null
                },
                meta: {},
                note: ''
            }, {
                transaction
            });

            if (!email && user) {
                email = user.email
            }
            // Insert items
            for (let item of items) {
                let i = await OrderItem.create({
                    id: uuid(),
                    orderId: order.id,
                    parentId: null,
                    itemInfo: item.itemInfo,
                    serial: item.serial,
                    size: item.size,
                    gender: item.gender,
                    price: item.price,
                    quantity: item.quantity,
                    type: item.type,
                    productCode: item.productCode
                }, {
                    transaction
                });
                if (item.withDiamond) {
                    for (let d of item.withDiamond) {
                        await OrderItem.create({
                            id: uuid(),
                            orderId: order.id,
                            parentId: i.id,
                            itemInfo: d.itemInfo,
                            serial: d.serial,
                            size: d.size,
                            gender: d.gender,
                            price: d.price,
                            quantity: d.quantity,
                            type: d.type,
                            productCode: d.productCode
                        }, {
                            transaction
                        });
                    }
                }
            }
            // Remove Cart
            await cart.destroy({
                transaction
            });
            await transaction.commit();

            // TODO: send order to Odoo queue
            if (order.paymentMethod == Order.PAYMENT_METHOD.ONLINE) {
                res.setSuccess(order, Constant.instance.HTTP_CODE.Created);
                return res.send(ctx);
            }
            // Send mail
            
            // Return info
            res.setSuccess(order, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postNewOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            if (transaction) await transaction.rollback();
            return res.send(ctx);
        }
    }

    static getOrderInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id;
            }
            let user;
            if (ctx.state.user) {
                user = ctx.state.user
            }
            let order = await Order.findOne({
                where: condition,
                required: false,
                attributes: {
                    exclude: ["logs", "paymentInfo", "note"]
                },
                include: [{
                    model: OrderItem,
                    as: 'items',
                    where: {
                        parentId: null
                    },
                    include: [{
                        as: 'withDiamond',
                        model: OrderItem,
                        required: false
                    }]
                }]
            });
            if (!order) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            if ((order.userId && (user && user.id != order.userId))) {
                res.setError(`Forbidden`, Constant.instance.HTTP_CODE.Forbidden, null, Constant.instance.ERROR_CODE.ORDER_NOT_BELONG_TO_USER);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(order, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getOrderInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getOrderList = async (ctx, next) => {
        try {
            let user = ctx.state.user;
            const query = ctx.request.query;
            // Query
            const condition = {
                customerId: user.id
            };
            const pager = paging(query);
            const info = await Promise.all([Order.findAll(Object.assign({
                where: condition,
                required: false,
                attributes: ["id", "code", "status", "paymentStatus", "totalPrice", "totalCost", "totalDiscount", "createdAt", "updatedAt"],
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: OrderItem,
                    as: 'items',
                    where: {
                        parentId: null
                    },
                    include: [{
                        as: 'withDiamond',
                        model: OrderItem,
                        required: false
                    }]
                }, {
                    model: ReturnForm,
                    as: 'returnForms',
                    attributes: ['id', 'createdAt', 'status']
                }]
            }, pager)), Order.count({
                where: condition
            })]);

            // Return list
            res.setSuccess({
                count: info[1],
                data: info[0]
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getOrderList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}