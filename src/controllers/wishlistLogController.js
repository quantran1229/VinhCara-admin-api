import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Op,
    Sequelize,
    QueryTypes
} from 'sequelize';
import {
    v4 as uuid
} from 'uuid';
import db, {
    Jewellery,
    DiamondSerial,
    Diamond,
    WishlistLog
} from '../models';
import {
    paging
} from '../utils/utils';

const res = new Response();

export default class WishlistController {
    // Check health, return memory usage + uptime + mediafile disk size
    static postAddWishlist = async (ctx, next) => {
        try {
            let user = ctx.state.user;
            const {
                id,
                type
            } = ctx.request.body;
            let status = WishlistLog.STATUS.LIKE;
            if (type == WishlistLog.PRODUCT_TYPE.JEWELLERY) {
                let resultFromPromise = await Promise.all([Jewellery.findOne({
                    where: {
                        productCode: id
                    }
                }), WishlistLog.findOne({
                    where: {
                        customerId: user.id,
                        productCode: id,
                        productType: WishlistLog.PRODUCT_TYPE.JEWELLERY,
                        isCurrent: true
                    }
                })]);
                if (!resultFromPromise[0]) {
                    res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
                if (resultFromPromise[1]) {
                    status = -resultFromPromise[1].status;
                    let t = await db.sequelize.transaction();
                    try {
                        await Promise.all([resultFromPromise[1].update({
                            isCurrent: false
                        }, {
                            transaction: t
                        }), WishlistLog.create({
                            id: uuid(),
                            customerId: user.id,
                            productCode: id,
                            productType: WishlistLog.PRODUCT_TYPE.JEWELLERY,
                            isCurrent: true,
                            status: status
                        }, {
                            transaction: t
                        })]);
                        await t.commit();
                    } catch (e) {
                        Logger.error('postAddWishlist ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
                        await t.rollback();
                    }
                } else {
                    await WishlistLog.create({
                        id: uuid(),
                        customerId: user.id,
                        productCode: id,
                        productType: WishlistLog.PRODUCT_TYPE.JEWELLERY,
                        isCurrent: true,
                        status: status
                    });
                }
            } else {
                let resultFromPromise = await Promise.all([DiamondSerial.findOne({
                    where: {
                        serial: id
                    }
                }), WishlistLog.findOne({
                    where: {
                        customerId: user.id,
                        productCode: id,
                        productType: WishlistLog.PRODUCT_TYPE.DIAMOND,
                        isCurrent: true
                    }
                })]);
                if (!resultFromPromise[0]) {
                    res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
                if (resultFromPromise[1]) {
                    status = -resultFromPromise[1].status;
                    let t = await db.sequelize.transaction();
                    try {
                        await Promise.all([resultFromPromise[1].update({
                            isCurrent: false
                        }, {
                            transaction: t
                        }), WishlistLog.create({
                            id: uuid(),
                            customerId: user.id,
                            productCode: id,
                            productType: WishlistLog.PRODUCT_TYPE.DIAMOND,
                            isCurrent: true,
                            status: status
                        }, {
                            transaction: t
                        })]);
                        await t.commit();
                    } catch (e) {
                        Logger.error('postAddWishlist ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
                        await t.rollback();
                    }
                } else {
                    await WishlistLog.create({
                        id: uuid(),
                        customerId: user.id,
                        productCode: id,
                        productType: WishlistLog.PRODUCT_TYPE.DIAMOND,
                        isCurrent: true,
                        status: status
                    });
                }
            }
            // Return info
            res.setSuccess({
                status: status
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postAddWishlist ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getProductWishList = async (ctx, next) => {
        try {
            // get current user
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const query = ctx.request.query;
            // Query
            const condition = {
                isLuxury: false
            };
            let order = [
                ['productName', 'ASC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'A-Z':
                        order = [
                            ['productName', 'ASC']
                        ];
                        break;
                    case 'priceASC':
                        order = [
                            ['price', 'ASC']
                        ];
                        break;
                    case 'priceDESC':
                        order = [
                            ['price', 'DESC']
                        ];
                        break;
                }
            }

            if (query.category) {
                condition.category = Sequelize.literal(`'${query.category}' = ANY("productCategory")`)
            }

            if (query.productCode) {
                const list = query.productCode.split(',');
                condition.productCode = {
                    [Op.in]: list
                };
            }

            if (query.priceFrom != null && query.priceTo != null) {
                condition.price = {
                    [Op.between]: [parseInt(query.priceFrom) || 0, parseInt(query.priceTo) || 0]
                };
            } else
            if (query.priceFrom) {
                condition.price = {
                    [Op.gte]: parseInt(query.priceFrom)
                };
            } else
            if (query.priceTo) {
                condition.price = {
                    [Op.lte]: parseInt(query.priceTo)
                };
            }

            if (query.designForm) {
                let list = query.designForm.split(',');
                condition.designForm = {
                    [Op.in]: list
                };
            }

            if (query.gemstone) {
                const list = query.gemstone.split(',');
                condition.gemstone = {
                    [Op.in]: list
                };
            }

            if (query.diamondSize) {
                const list = query.diamondSize.split(',');
                condition.diamondSize = {
                    [Op.in]: list
                };
            }

            if (query.goldPropery) {
                const list = query.gemstone.split(',');
                condition.goldPropery = {
                    [Op.in]: list
                };
            }
            const pager = paging(query);
            let result = await Promise.all([Jewellery.count({
                where: condition,
                include: {
                    model: WishlistLog,
                    required: true,
                    where: {
                        customerId: user.id,
                        isCurrent: true,
                        status: WishlistLog.STATUS.LIKE,
                    },
                    as: 'wishlistInfo'
                }
            }), Jewellery.findAll(Object.assign({
                where: condition,
                order: order || [
                    ['productCode', 'ASC']
                ],
                attributes: [
                    ['productCode', 'id'], 'productCode', 'type', 'mediafiles', 'productName', 'mainCategory', 'productCategory', 'price'
                ],
                include: {
                    model: WishlistLog,
                    required: true,
                    where: {
                        customerId: user.id,
                        isCurrent: true,
                        status: WishlistLog.STATUS.LIKE,
                    },
                    as: 'wishlistInfo',
                    attributes: [
                        ['status', 'isLiked']
                    ]
                }
            }, pager))]);
            // Return list
            res.setSuccess({
                count: result[0],
                data: result[1]
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getProductWishList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getWishList = async (ctx, next) => {
        try {
            // get current user
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const query = ctx.request.query;
            // Query
            const condition = {
                isLuxury: false
            };
            let order = '"wishlistInfo.createdAt" DESC';
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'type':
                        order = `"mainCategory" ASC, "wishlistInfo.createdAt" DESC`
                        break;
                    case 'A-Z':
                        order = `"name" ASC, "wishlistInfo.createdAt" ASC`;
                        break;
                    case 'priceASC':
                        order = `"price" ASC, "wishlistInfo.createdAt" DESC`;
                        break;
                    case 'priceDESC':
                        order = `"price" DESC, "wishlistInfo.createdAt" DESC`;
                        break;
                }
            }

            const pager = paging(query);
            let resultFromDatabase = await Promise.all([
                new Promise(async (resolve, rej) => {
                    try {
                        let jewelleryOption = {
                            where: {
                                isLuxury: false
                            },
                            attributes: [
                                ['productCode', 'id'],
                                [Sequelize.fn('CONCAT', Sequelize.col("mainCategory"), " ", Sequelize.col("productName")), "name"],
                                'mainCategory', 'price',
                                [Sequelize.literal('1'), 'type'],
                                'mediafiles'
                            ],
                            include: [{
                                model: WishlistLog,
                                required: true,
                                where: {
                                    customerId: user.id,
                                    isCurrent: true,
                                    status: WishlistLog.STATUS.LIKE,
                                },
                                attributes: [
                                    ['status', 'isLiked'], 'createdAt'
                                ],
                                as: 'wishlistInfo'
                            }]
                        }
                        Jewellery._validateIncludedElements.bind(Jewellery)(jewelleryOption);
                        let resultFromJewellery = db.sequelize.dialect.queryGenerator.selectQuery('jewellery', jewelleryOption, Jewellery);
                        let diamondOption = {
                            attributes: [
                                ['serial', 'id'],
                                [Sequelize.fn('CONCAT', "Kim cương", " ", Sequelize.literal('"DiamondSerial"."size"')), "name"],
                                [Sequelize.literal("'Kim cương'"), 'mainCategory'], 'price',
                                [Sequelize.literal('2'), 'type'],
                                [Sequelize.literal('"generalInfo"."mediafiles"'), 'mediafiles']
                            ],
                            include: [{
                                model: WishlistLog,
                                required: true,
                                where: {
                                    customerId: user.id,
                                    isCurrent: true,
                                    status: WishlistLog.STATUS.LIKE,
                                },
                                attributes: [
                                    ['status', 'isLiked'], 'createdAt'
                                ],
                                as: 'wishlistInfo'
                            }, {
                                model: Diamond,
                                as: 'generalInfo',
                                attributes: []
                            }],
                        };
                        DiamondSerial._validateIncludedElements.bind(DiamondSerial)(diamondOption);
                        let resultFromDiamond = db.sequelize.dialect.queryGenerator.selectQuery('diamondSerials', diamondOption, DiamondSerial);
                        let text = `${resultFromJewellery.slice(0,-1)} UNION ALL ${resultFromDiamond.slice(0,-1)} ORDER BY ${order} LIMIT ${pager.limit} OFFSET ${pager.offset}`;
                        // Return list
                        let result = await db.sequelize.query(text, {
                            type: QueryTypes.SELECT,
                            nest: true
                        });
                        resolve(result);
                    } catch (e) {
                        Logger.error('getProductWishList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
                        resolve([]);
                    }
                }),
                WishlistLog.count(user.id)
            ])
            res.setSuccess({
                count: resultFromDatabase[1],
                data: resultFromDatabase[0]
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getProductWishList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteWishlist = async (ctx, next) => {
        try {
            // get current user
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            await WishlistLog.update({
                isCurrent: false
            }, {
                where: {
                    isCurrent: true,
                    customerId: user.id
                }
            })
            // Return list
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteWishlist ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}