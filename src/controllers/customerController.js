import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize';
import bcrypt from 'bcrypt';
import db, {
    Customer,
    Order,
    WishlistLog,
    OrderItem,
    Location,
    Jewellery,
    DiamondSerial,
    Diamond,
    SavedAddress
} from '../models';
import {
    paging
} from '../utils/utils';

const res = new Response();

export default class CustomerController {
    static getCustomerInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id;
            }
            const customer = await Customer.findOne({
                where: condition,
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    required: false,
                    model: Order,
                    as: 'orders',
                    attributes: ['id', 'code', 'createdAt', 'status', 'paymentStatus', 'paymentMethod', 'totalPrice'],
                    include: [{
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
                    }],
                }, {
                    model: WishlistLog,
                    as: 'wishlist',
                    required: false,
                    include: [{
                        model: Jewellery,
                        required: false,
                        as: 'jewelleryInfo',
                        attributes: [
                            ['productCode', 'id'], 'productCode', 'mainCategory', 'mediafiles', 'price'
                        ]
                    }, {
                        model: DiamondSerial,
                        required: false,
                        as: 'diamondInfo',
                        attributes: [
                            ['serial', 'id'], 'serial', 'price', 'GIAReportNumber'
                        ],
                        include: [{
                            model: Diamond,
                            as: 'generalInfo',
                            attributes: ['productCode', 'productName', 'mediafiles']
                        }]
                    }]
                }]
            });
            if (!customer) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            customer.dataValues.totalOrderCount = customer.dataValues.orders.length;
            customer.dataValues.totalOrderPrice = customer.dataValues.orders.reduce((r, e) => {
                return r + parseInt(e.totalPrice)
            }, 0);
            let wishlist = customer.dataValues.wishlist.filter(e => e.dataValues.jewelleryInfo || e.dataValues.diamondInfo);
            customer.dataValues.totalWishlist = wishlist.length;
            customer.dataValues.wishlist = wishlist;
            // Return info
            res.setSuccess(customer, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCustomerInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCustomerList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.phone) {
                condition.phone = {
                    [Op.like]: `%${query.phone}%`
                };
            }
            if (query.email) {
                condition.email = {
                    [Op.iLike]: `%${query.email}%`
                };
            }
            if (query.code) {
                condition.code = {
                    [Op.iLike]: `%${query.code}%`
                }
            }
            if (query.status) {
                condition.status = query.status;
            }
            if (query.name) {
                query.name = removeAccent(query.name)
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('"Customer"."name"')), {
                    [Op.iLike]: `%${query.name}%`
                });
            }
            let pager = paging(query);
            const result = await Customer.findAndCountAll(Object.assign({
                where: condition,
                attributes: ['id', 'code', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: SavedAddress,
                    as: 'defaultAddress',
                    required: false,
                    attributes: ['address', 'districtId', 'cityId', 'providenceId'],
                    include: [{
                            model: Location,
                            as: 'providenceInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'cityInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'districtInfo',
                            attributes: ['id', 'name', 'type']
                        }
                    ]
                }]
            }, pager));

            // Return list
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCustomerList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putCustomerInfo = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id;
            }
            let customer = await Customer.findOne({
                where: condition
            });
            if (!customer) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                name,
                email,
                phone,
                dob,
                gender,
                maritalStatus,
                avatar,
                password,
                status
            } = ctx.request.body;
            // Get current customer id from token
            let updateInfo = {};
            if ((email && email != customer.email) || (phone && phone != customer.phone)) {
                let checkDuplicate = await Promise.all([
                    (email && email != customer.email) ?
                    Customer.findOne({
                        where: {
                            email: email,
                            id: {
                                [Op.not]: id
                            }
                        }
                    }) : null,
                    (phone && phone != customer.phone) ?
                    Customer.findOne({
                        where: {
                            phone: phone,
                            id: {
                                [Op.not]: id
                            }
                        }
                    }) : null
                ]);
                // Validate info from database
                if (checkDuplicate[0] || checkDuplicate[1]) {
                    if (checkDuplicate[0]) {
                        res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, {
                            field: 'email'
                        }, Constant.instance.ERROR_CODE.CUSTOMER_DUPLICATE_EMAIL);
                        return res.send(ctx);
                    }
                    res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'phone'
                    }, Constant.instance.ERROR_CODE.CUSTOMER_DUPLICATE_PHONE);
                    return res.send(ctx);
                }
                if (email && email != customer.email) {
                    updateInfo.email = email;
                }
                if (phone && phone != customer.phone) {
                    updateInfo.phone = phone;
                }
            }
            // Save to database
            if (name && name != customer.name) {
                updateInfo.name = name;
            }
            if (gender && gender != customer.gender) {
                updateInfo.gender = gender;
            }
            if (maritalStatus && maritalStatus != customer.maritalStatus) {
                updateInfo.maritalStatus = maritalStatus;
            }
            if (dob && dob != customer.dob) {
                updateInfo.dob = dob;
            }
            if (avatar && avatar != customer.avatar) {
                updateInfo.avatar = avatar;
            }
            if (password){
                const saltRounds = Constant.instance.DEFAULT_CUSTOMER_SALT_ROUND;
                let hashPassword = bcrypt.hashSync(password, saltRounds);
                updateInfo.password = hashPassword;
            }
            if (status)
            {
                updateInfo.status = status;
            }
            // update
            customer = await customer.update(updateInfo);
            // Remove password
            customer.dataValues.password = null;
            res.setSuccess(customer, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}