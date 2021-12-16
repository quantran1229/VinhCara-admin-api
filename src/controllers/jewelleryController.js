import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize'
import db, {
    Jewellery,
    JewelleryCategory,
    JewellerySerial,
    Collection,
    Combo,
    NewJewellery,
    WishlistLog,
    StoreContact,
    Location,
    Diamond,
    DiamondSerial
} from '../models';
import {
    paging
} from '../utils/utils';

const res = new Response();

export default class JewelleryController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getJewelleryInfo = async (ctx, next) => {
        try {
            // Get current customer if have any
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const id = ctx.request.params.id;
            // let jewellery = await Jewellery.getInfo(id);
            // if (!jewellery) {
            //     res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            // }
            let resultFromJewelleryAndComboAndCollection = await Promise.all([
                Jewellery.getInfo(id, user ? user.id : null),
                Collection.findOne({
                    where: {
                        [Op.and]: {
                            code: Sequelize.literal(`'${id}' = ANY("productCode")`),
                        }
                    },
                    attributes: ['id', 'name', 'bannerInfo', 'productCode']
                }),
                Combo.findOne({
                    where: {
                        [Op.and]: {
                            code: Sequelize.literal(`'${id}' = ANY("productCode")`),
                        }
                    },
                    attributes: ['id', 'name', 'bannerInfo'],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }),
                StoreContact.findAll({
                    attributes: ['id', 'name', 'openTime', 'directionLink', 'phone', 'mediafiles', 'stockId'],
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
                    ],
                })
            ]);
            const storeContacts = resultFromJewelleryAndComboAndCollection[3];
            let jewellery = resultFromJewelleryAndComboAndCollection[0];
            if (!jewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }

            // let sizeList = [];
            // let skipList = [];
            // for (let serial of jewellery.serialList) {
            //     if (sizeList.includes(serial.size)) {
            //         skipList.push(serial.serial);
            //         continue;
            //     }
            //     sizeList.push(serial.size);
            //     if (serial.size == jewellery.size) serial.dataValues.isDefault = true;
            //     if (serial.type == JewellerySerial.TYPE.REAL)
            //         serial.dataValues.inStoreList = storeContacts.filter(e => {
            //             return e.stockId == serial.stockId;
            //         })
            // }
            // jewellery.serialList = jewellery.serialList.filter(e => !skipList.includes(e));
            if (resultFromJewelleryAndComboAndCollection[2]) {
                jewellery.dataValues.additionalBanner = resultFromJewelleryAndComboAndCollection[2].bannerInfo;
            } else if (resultFromJewelleryAndComboAndCollection[1]) {
                jewellery.dataValues.additionalBanner = resultFromJewelleryAndComboAndCollection[1].bannerInfo;
            }
            //Get info from database: Similar product, similar diamond
            let resultPromiseFromDatabase = await Promise.all([
                new Promise(async (res, rej) => {
                    try {
                        // get collections that has this jewellery
                        let check = null;
                        if (resultFromJewelleryAndComboAndCollection[1]) {
                            let productCodeList = resultFromJewelleryAndComboAndCollection[1].productCode;
                            let text = productCodeList.filter(e => e != jewellery.productCode).reduce((t, e) => {
                                if (t.length > 0) return t + `,'${e}'`
                                else return `'${e}'`
                            }, '');
                            check = `(CASE WHEN "productCode" IN (${text}) THEN 1 ELSE 0 END) +`;
                            resultFromJewelleryAndComboAndCollection[1].productCode = null;
                        }
                        let list = await Jewellery.findAll({
                            where: Sequelize.and(
                                Sequelize.literal(`'${jewellery.productCategory[jewellery.productCategory.length -2]}' = ANY("productCategory")`), {
                                    productCode: {
                                        [Op.not]: jewellery.productCode
                                    }
                                }),
                            attributes: ['productCode', 'price', 'productName', 'mainCategory', 'mediafiles', [
                                Sequelize.literal( // Score point base on similar attribute
                                    `
                                    ${check ? check : ''}
                                    (CASE WHEN "mainCategory" = '${jewellery.mainCategory}' THEN 2 ELSE 0 END) + 
                                    (CASE WHEN "designForm" ${jewellery.designForm == null ? 'IS NULL' : ` = '${jewellery.designForm}'` } THEN 1 ELSE 0 END) + 
                                    (CASE WHEN "goldProperty" = '${jewellery.goldProperty}' THEN 1 ELSE 0 END) + 
                                    (CASE WHEN "diamondSize" ${jewellery.diamondSize == null ? 'IS NULL': `= ${jewellery.diamondSize}` } THEN 1 ELSE 0 END) + 
                                    (CASE WHEN "price" BETWEEN ${parseInt(jewellery.price) - Constant.instance.SIMILAR_PRICE_RANGE} AND ${parseInt(jewellery.price) + Constant.instance.SIMILAR_PRICE_RANGE} THEN 1 ELSE 0 END)
                                    `
                                ), 'point'
                            ]],
                            limit: 12,
                            order: [
                                [Sequelize.literal("point"), 'DESC']
                            ]
                        });
                        res(list);
                    } catch (e) {
                        Logger.error('getJewelleryInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
                        res([]);
                    }
                }), jewellery.increment('totalViews'), // increase total count for totalViews
                new Promise((res, rej) => {
                    try {
                        switch (jewellery.type) {
                            case Jewellery.TYPE.SINGLE:
                                // Single only show info of serial that has 
                                let realSerial = jewellery.serialList.filter(e => e.type == JewellerySerial.TYPE.REAL);
                                jewellery.dataValues.singleInfo = {
                                    serialList: jewellery.serialList,
                                    inStoreList: storeContacts.filter(e => realSerial.map(e => e.stockId).includes(e.stockId)),
                                }
                                // Hide serialList
                                jewellery.dataValues.serialList = undefined;
                                break;
                            case Jewellery.TYPE.DOUBLE:
                                // Divided to 2 groups, male and female
                                let maleSerial = [];
                                let femaleSerial = [];
                                for (let serial of jewellery.serialList) {
                                    if (serial.gender == JewellerySerial.GENDER.MALE) maleSerial.push(serial)
                                    else femaleSerial.push(serial)
                                }
                                let maleSize = [...new Set(((jewellery.sizeInfo.dataValues.subs.find(e => e.name == 'Nhẫn cưới nam') || {
                                    dataValues: {}
                                }).dataValues.size || []).concat(maleSerial.map(e => e.size)))].sort((a, b) => {
                                    if (!isNaN(a) && !isNaN(b)) {
                                        return parseInt(a) - parseInt(b)
                                    } else return a - b;
                                });
                                let femaleSize = [...new Set(((jewellery.sizeInfo.dataValues.subs.find(e => e.name == 'Nhẫn cưới nữ') || {
                                    dataValues: {}
                                }).dataValues.size || []).concat(femaleSerial.map(e => e.size)))].sort((a, b) => {
                                    if (!isNaN(a) && !isNaN(b)) {
                                        return parseInt(a) - parseInt(b)
                                    } else return a - b;
                                });
                                let male = [];
                                for (let size of maleSize) {
                                    let serialList = maleSerial.filter(e => e.size == size);
                                    let realSerial = serialList.filter(e => e.type == JewellerySerial.TYPE.REAL);
                                    male.push({
                                        size: size,
                                        isDefault: size == (jewellery.sizeInfo.dataValues.subs.find(e => e.name == 'Nhẫn cưới nam') || {
                                            dataValues: {}
                                        }).dataValues.defaultSize,
                                        serialList: serialList,
                                        inStoreList: storeContacts.filter(e => realSerial.map(e => e.stockId).includes(e.stockId)),
                                    })
                                }
                                let female = [];
                                for (let size of femaleSize) {
                                    let serialList = femaleSerial.filter(e => e.size == size);
                                    let realSerial = serialList.filter(e => e.type == JewellerySerial.TYPE.REAL);
                                    female.push({
                                        size: size,
                                        isDefault: size == (jewellery.sizeInfo.dataValues.subs.find(e => e.name == 'Nhẫn cưới nữ') || {
                                            dataValues: {}
                                        }).dataValues.defaultSize,
                                        serialList: serialList,
                                        inStoreList: storeContacts.filter(e => realSerial.map(e => e.stockId).includes(e.stockId)),
                                    })
                                }
                                jewellery.dataValues.doubleInfo = {
                                    male: male,
                                    female: female
                                };
                                // Hide serialList
                                jewellery.dataValues.serialList = undefined;
                                break;
                            case Jewellery.TYPE.CUSTOMIZE_SIZE:
                                // Show size
                                let sizeList = [...new Set((jewellery.sizeInfo.dataValues.size || []).concat(jewellery.serialList.map(e => e.size)))].sort((a, b) => {
                                    if (!isNaN(a) && !isNaN(b)) {
                                        return parseInt(a) - parseInt(b)
                                    } else return a - b;
                                });
                                let customizeSize = [];
                                for (let size of sizeList) {
                                    let serialList = jewellery.serialList.filter(e => e.size == size);
                                    let realSerial = serialList.filter(e => e.type == JewellerySerial.TYPE.REAL);
                                    customizeSize.push({
                                        size: size,
                                        isDefault: size == jewellery.sizeInfo.dataValues.defaultSize,
                                        serialList: serialList,
                                        inStoreList: storeContacts.filter(e => realSerial.map(e => e.stockId).includes(e.stockId)),
                                    });
                                }
                                jewellery.dataValues.customizeSizeInfo = customizeSize;
                                // Hide serialList
                                jewellery.dataValues.serialList = undefined;
                                break;
                        }
                    } catch (e) {
                        Logger.error('getJewelleryInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
                    } finally {
                        res();
                    }
                }), jewellery.hasDiamond == 1 && jewellery.TYPE != Jewellery.TYPE.DOUBLE ?
                DiamondSerial.findAll({
                    where: {
                        shape: jewellery.shape,
                        size: {
                            [Op.between]: [parseFloat(jewellery.diamondSize) - 0.5, parseFloat(jewellery.diamondSize) + 0.5]
                        }
                    },
                    attributes: [
                        ['serial', 'id'], 'shape', 'size', 'caraWeight', 'color', 'clarity', 'cut', 'price', 'GIAReportNumber', 'type'
                    ],
                    include: [{
                        model: Diamond,
                        as: 'generalInfo',
                        attributes: ['productCode', 'productName', 'mediafiles']
                    }],
                    limit: Constant.instance.DEFAULT_NUMBER_DIAMOND_FOR_JEWELLERY
                }) // get diamond similar
                :
                null
            ]);
            jewellery.dataValues.similarProduct = resultPromiseFromDatabase[0];
            jewellery.dataValues.collectionInfo = resultFromJewelleryAndComboAndCollection[1];
            jewellery.dataValues.comboInfo = resultFromJewelleryAndComboAndCollection[2];
            if (jewellery.hasDiamond > 0 && jewellery.TYPE != Jewellery.TYPE.DOUBLE) jewellery.dataValues.diamondRecomendList = resultPromiseFromDatabase[3];
            res.setSuccess(jewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewelleryFilterList = async (ctx, next) => {
        try {
            let filterList = await Promise.all([
                Jewellery.findAll({
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('designForm')), "designForm"]
                    ]
                }),
                Jewellery.findAll({
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('diamondSize')), "diamondSize"]
                    ]
                }),
                Jewellery.findAll({
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('gemstone')), "gemstone"]
                    ]
                })
            ])
            const filter = {
                designForm: filterList[0].map(e => e.designForm),
                diamondSize: filterList[1].map(e => e.diamondSize),
                gemstone: filterList[2].map(e => e.gemstone)
            }
            // Return list
            res.setSuccess(filter, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);

        } catch (e) {
            Logger.error('getJewelleryFilterList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewelleryCategoryList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            let condition = {};
            if (query.parentId) {
                condition.parentId = query.parentId
            }
            let result = await JewelleryCategory.findAll({
                where: condition,
                include: [{
                    model: JewelleryCategory,
                    as: 'parent',
                    attributes: ['id', 'name']
                }, {
                    model: JewelleryCategory,
                    as: 'subs',
                    attributes: ['id', 'name']
                }]
            })
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);

        } catch (e) {
            Logger.error('getJewelleryCategoryList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewelleryList = async (ctx, next) => {
        try {
            // get current user
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const query = ctx.request.query;
            // Query
            let checkNew = false;
            const condition = {
                isLuxury: false
            };
            let order = [
                ['productName', 'ASC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'newest':
                        checkNew = true;
                        order = [
                            [{
                                model: NewJewellery,
                                as: 'newProductInfo'
                            }, 'order', 'ASC']
                        ]
                        break;
                    case 'popular':
                        order = [
                            ['totalOrders', 'DESC'],
                            ['totalViews', 'DESC']
                        ];
                        break;
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
                if (query.category.includes('-')) {
                    condition.category = Sequelize.literal(`'${removeAccent(query.category.trim().toLowerCase())}' = ANY("productCategorySlug")`)
                } else
                    condition.category = Sequelize.literal(`'${query.category}' = ANY("productCategory")`);
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
            let result = await Jewellery.getList(condition, pager, order, user ? user.id : null, checkNew);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getNewJewellery = async (ctx, next) => {
        try {
            let user = null;
            let include = [{
                model: NewJewellery,
                as: 'newProductInfo',
                required: true,
                attributes: ['order']
            }]
            if (ctx.state.user) {
                user = ctx.state.user;
                include.push({
                    model: WishlistLog,
                    required: false,
                    where: {
                        customerId: user.id,
                        isCurrent: true,
                        status: WishlistLog.STATUS.LIKE,
                    },
                    as: 'wishlistInfo',
                    attributes: [
                        ['status', 'isLiked']
                    ]
                })
            }
            let list = await Jewellery.findAll({
                include: include,
                attributes: [
                    ['productCode', 'id'], 'productCode', 'type', 'mediafiles', 'productName', 'mainCategory', 'productCategory', 'price'
                ],
                order: [
                    [{
                        model: NewJewellery,
                        as: 'newProductInfo'
                    }, 'order', 'ASC']
                ]
            });
            // Return list
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getNewJewellery ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}