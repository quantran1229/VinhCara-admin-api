import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    remove as removeAccent
} from 'diacritics'
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
    Customer,
    OrderItem,
    ReturnForm,
    Location,
    JewellerySerial,
    DiamondSerial
} from '../models';

const res = new Response();

export default class OrderController {
    static getOrderInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id;
            }
            let order = await Order.findOne({
                where: condition,
                include: [{
                        model: Customer,
                        as: 'customerInfo',
                        attributes: ['id', 'code', 'name', 'phone'],
                        required: false
                    },
                    {
                        required: false,
                        model: OrderItem,
                        as: 'items',
                        attributes: ['id', 'type', 'quantity', 'gender', 'size', 'lettering', 'price', 'itemInfo'],
                        where: {
                            parentId: null
                        },
                        include: [{
                            required: false,
                            model: OrderItem,
                            as: 'withDiamond',
                            attributes: ['id', 'type', 'quantity', 'gender', 'size', 'lettering', 'price', 'itemInfo'],
                        }]
                    },
                    {
                        model: Location,
                        as: 'districtInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: Location,
                        as: 'cityInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: Location,
                        as: 'providenceInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: Location,
                        as: 'giftDistrictInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: Location,
                        as: 'giftCityInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: Location,
                        as: 'giftProvidenceInfo',
                        attributes: ['id', 'type', 'name']
                    }, {
                        model: ReturnForm,
                        as: 'returnForms'
                    }
                ],
            });
            if (!order) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
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
            const query = ctx.request.query;
            // Query
            let condition = {};
            if (query.status) {
                condition.status = query.status;
            }
            if (query.phone) {
                condition.phone = {
                    [Op.iLike]: `%${query.phone}%`
                }
            }
            if (query.paymentMethod) {
                condition.paymentMethod = query.paymentMethod;
            }
            if (query.code) {
                condition.code = {
                    [Op.iLike]: `%${query.code}%`
                }
            }
            if (query.status) {
                condition.status = query.status;
            }
            if (query.dateFrom != null && query.dateTo != null) {
                condition.createdAt = {
                    [Op.between]: [dayjs(query.dateFrom, 'YYYYMMDD').startOf('day').toISOString(), dayjs(query.dateTo, 'YYYYMMDD').endOf('day').toISOString()]
                };
            } else
            if (query.dateFrom) {
                condition.createdAt = {
                    [Op.gte]: dayjs(query.dateFrom, 'YYYYMMDD').startOf('day').toISOString()
                };
            } else
            if (query.dateTo) {
                condition.createdAt = {
                    [Op.lte]: dayjs(query.dateTo, 'YYYYMMDD').endOf('day').toISOString()
                };
            }
            if (query.customerId) {
                condition.userId = query.customerId;
            }
            if (query.customerType == 2) {
                condition.userId = {
                    [Op.not]: null
                }
            }
            if (query.keyword) {
                let keyword = removeAccent(query.keyword).toLowerCase();
                condition = {
                    [Op.or]: [{
                            isGift: false,
                            recieverName: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            isGift: true,
                            giftRecieverName: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }, {
                            isGift: false,
                            phone: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }, {
                            isGift: true,
                            giftPhone: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            code: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }
                    ]
                }
            }
            let order = [
                ['createdAt', 'DESC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'newest':
                        order = [
                            ['createdAt', 'DESC']
                        ];
                        break;
                    case 'statusASC':
                        order = [
                            ['status', 'DESC']
                        ];
                        break;
                    case 'statusDESC':
                        order = [
                            ['status', 'DESC']
                        ];
                        break;
                    case 'priceASC':
                        order = [
                            ['totalPrice', 'ASC']
                        ];
                        break;
                    case 'priceDESC':
                        order = [
                            ['totalPrice', 'DESC']
                        ];
                        break;
                }
            }
            let pager = paging(query);
            const result = await Order.findAndCountAll(Object.assign({
                where: condition,
                attributes: ['id', 'code', 'recieverName', 'phone', 'address', 'status', 'createdAt', 'isGift', 'giftRecieverName', 'giftPhone', 'giftAddress', 'totalPrice', 'paymentMethod'],
                include: [{
                    model: Location,
                    as: 'districtInfo',
                    attributes: ['id', 'type', 'name']
                }, {
                    model: Location,
                    as: 'cityInfo',
                    attributes: ['id', 'type', 'name']
                }, {
                    model: Location,
                    as: 'providenceInfo',
                    attributes: ['id', 'type', 'name']
                }, {
                    model: Location,
                    as: 'giftDistrictInfo',
                    attributes: ['id', 'type', 'name']
                }, {
                    model: Location,
                    as: 'giftCityInfo',
                    attributes: ['id', 'type', 'name']
                }, {
                    model: Location,
                    as: 'giftProvidenceInfo',
                    attributes: ['id', 'type', 'name']
                }],
                order: [
                    ['createdAt', 'DESC']
                ]
            }, pager));
            // Return list
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getOrderList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putOrderInfo = async (ctx, next) => {
        try {
            const user = ctx.state.user;
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id;
            }
            let order = await Order.findOne({
                where: condition,
            });
            if (!order) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                note,
                status,
                recieverName,
                address,
                email,
                phone,
                cityId,
                districtId,
                providenceId,
                isGift,
                giftRecieverName,
                giftPhone,
                giftAddress,
                giftDistrictId,
                giftCityId,
                giftProvidenceId,
                paymentInfo
            } = ctx.request.body;
            let updateInfo = {}
            if (isGift && !order.isGift) {
                let errorList = [];
                if (!giftRecieverName) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftRecieverName',
                        message: 'required'
                    })
                }
                if (!giftAddress) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftAddress',
                        message: 'required'
                    })
                }
                if (!giftPhone) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftPhone',
                        message: 'required'
                    })
                }
                if (!giftDistrictId) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftDistrictId',
                        message: 'required'
                    })
                }
                if (!giftCityId) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftCityId',
                        message: 'required'
                    })
                }
                if (!giftProvidenceId) {
                    errorList.push({
                        code: 'missing_field',
                        field: 'giftProvidenceId',
                        message: 'required'
                    })
                }
                if (errorList.length > 0) {
                    res.setError(`Bad request`, Constant.instance.HTTP_CODE.BadRequest, errorList);
                    return res.send(ctx);
                }
                updateInfo = {
                    isGift,
                    giftAddress,
                    giftRecieverName,
                    giftCityId,
                    giftDistrictId,
                    giftProvidenceId,
                    giftPhone
                }
            }
            if (note && order.note != note) {
                updateInfo.note = note
            }
            if (recieverName && recieverName != order.recieverName) {
                updateInfo.recieverName = recieverName
            }
            if (address && address != order.address) {
                updateInfo.address = address
            }
            if (phone && phone != order.phone) {
                updateInfo.phone = phone
            }
            if (email && email != order.email) {
                updateInfo.email = email
            }
            if (cityId && cityId != order.cityId) {
                updateInfo.cityId = cityId
            }
            if (districtId && districtId != order.districtId) {
                updateInfo.districtId = districtId
            }
            if (providenceId && providenceId != order.providenceId) {
                updateInfo.providenceId = providenceId
            }
            let removeSerial = false;
            let deleteSerial = false;
            let revertSerial = false;
            if (status && status != order.status) {
                if (status > 0 && status < order.status) {
                    res.setError(`Status must be > current status or cancel`, Constant.instance.HTTP_CODE.Forbidden, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
                    return res.send(ctx);
                }
                // Check flow
                if (order.paymentMethod == Order.PAYMENT_METHOD.ONLINE) {
                    if (status > 0 && status < Order.STATUS.PROCESSING) {
                        res.setError(`Status must be > 3`, Constant.instance.HTTP_CODE.Forbidden, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
                        return res.send(ctx);
                    }
                } else if (order.paymentMethod == Order.PAYMENT_METHOD.COD) {
                    if (status > 0 && status < Order.STATUS.PROCESSING) {
                        res.setError(`Status must be > 3`, Constant.instance.HTTP_CODE.Forbidden, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
                        return res.send(ctx);
                    }
                    if (status == Order.STATUS.SHIPPING) {
                        removeSerial = true;
                    }
                } else {
                    if (status == Order.STATUS.WAITING_FOR_PAYMENT) {
                        removeSerial = true;
                    }
                }

                updateInfo.status = status || order.status;
                let logs = JSON.parse(JSON.stringify(order.logs));
                logs.push({
                    by: user.id,
                    id: logs.length,
                    status: updateInfo.status,
                    createdAt: dayjs().unix()
                })
                updateInfo.logs = logs;
                if (status == Order.STATUS.CANCEL) {
                    revertSerial = true;
                } else if (status == Order.STATUS.DONE) {
                    deleteSerial = true;
                }
            }
            if (paymentInfo) {
                let ob = {
                    info: paymentInfo,
                    createdAt: dayjs().unix()
                }
                updateInfo.paymentInfo = ob;
            }
            order = await order.update(updateInfo);
            if (removeSerial) await this.removeStockFromOrder(order.id);
            if (deleteSerial) await this.deleteStockFromOrder(order.id);
            if (revertSerial) await this.revertStockFromOrder(order.id);
            // Return info
            res.setSuccess(order, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putOrderInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteStockFromOrder = async (orderId) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            let orderItems = await OrderItem.findAll({
                where: {
                    orderId: orderId
                },
                attributes: ['serial', 'type']
            });
            let jewList = [];
            let diaList = [];
            jewList = orderItems.filter(e => e.type == OrderItem.TYPE.JEWELLERY).map(e => e.serial);
            diaList = orderItems.filter(e => e.type == OrderItem.TYPE.DIAMOND).map(e => e.serial);
            await Promise.all([JewellerySerial.destroy({
                where: {
                    serial: {
                        [Op.in]: jewList
                    },
                    status: -1
                },
                transaction: transaction
            }), DiamondSerial.destroy({
                where: {
                    serial: {
                        [Op.in]: diaList
                    },
                    status: -1
                },
                transaction: transaction
            })]);
            await transaction.commit();
            return;
        } catch (e) {
            Logger.error('removeStockFromOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            if (transaction) await transaction.rollback();
            return;
        }
    }

    static removeStockFromOrder = async (orderId) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            let orderItems = await OrderItem.findAll({
                where: {
                    orderId: orderId
                },
                attributes: ['serial', 'type']
            });
            let jewList = [];
            let diaList = [];
            jewList = orderItems.filter(e => e.type == OrderItem.TYPE.JEWELLERY).map(e => e.serial);
            diaList = orderItems.filter(e => e.type == OrderItem.TYPE.DIAMOND).map(e => e.serial);
            await Promise.all([JewellerySerial.update({
                status: -1
            }, {
                where: {
                    serial: {
                        [Op.in]: jewList
                    },
                    status: 1
                },
                transaction: transaction
            }), DiamondSerial.update({
                status: -1
            }, {
                where: {
                    serial: {
                        [Op.in]: diaList
                    },
                    status: 1
                },
                transaction: transaction
            })]);
            await transaction.commit();
            return;
        } catch (e) {
            Logger.error('removeStockFromOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            if (transaction) await transaction.rollback();
            return;
        }
    }

    static revertStockFromOrder = async (orderId) => {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            let orderItems = await OrderItem.findAll({
                where: {
                    orderId: orderId
                },
                attributes: ['serial', 'type']
            });
            let jewList = [];
            let diaList = [];
            jewList = orderItems.filter(e => e.type == OrderItem.TYPE.JEWELLERY).map(e => e.serial);
            diaList = orderItems.filter(e => e.type == OrderItem.TYPE.DIAMOND).map(e => e.serial);
            await Promise.all([JewellerySerial.update({
                status: 1
            }, {
                where: {
                    serial: {
                        [Op.in]: jewList
                    },
                    status: -1
                },
                transaction: transaction
            }), DiamondSerial.update({
                status: 1
            }, {
                where: {
                    serial: {
                        [Op.in]: diaList
                    },
                    status: -1
                },
                transaction: transaction
            })]);
            await transaction.commit();
            return;
        } catch (e) {
            Logger.error('removeStockFromOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            if (transaction) await transaction.rollback();
            return;
        }
    }
}