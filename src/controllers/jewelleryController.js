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
    Stock,
    Category
} from '../models';
import {
    paging
} from '../utils/utils';
import dayjs from 'dayjs';
import csvConverter from 'json-2-csv';
import csv from 'csvtojson/v2';
import multer from '@koa/multer';
const storage = multer.memoryStorage();

// Upload Limit
const limit = {
    fileSize: 10 * 1000000 // calculate by byte
}

// Filter only image + video
function fileFilter(req, file, cb) {
    let mimeType = file.mimetype;
    let mainType = mimeType.split('/')[1];
    if (mainType !== 'csv') {
        return cb(null, false)
    }
    return cb(null, true)
}

const uploadSingle = multer({
    storage: storage,
    limit: limit,
    fileFilter: fileFilter
}).single("file")
const res = new Response();

export default class JewelleryController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getJewelleryInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let jewellery = await Jewellery.getInfo(id);
            if (!jewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }
            let collectionAndCombo = await Promise.all([Collection.findAll({
                    where: {
                        [Op.and]: {
                            code: Sequelize.literal(`'${id}' = ANY("productCode")`),
                        }
                    },
                    attributes: ['id', 'name', 'bannerInfo', 'productCode']
                }),
                Combo.findAll({
                    where: {
                        [Op.and]: {
                            code: Sequelize.literal(`'${id}' = ANY("productCode")`),
                        }
                    },
                    attributes: ['id', 'name', 'bannerInfo'],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                })
            ]);
            jewellery.dataValues.collectionList = collectionAndCombo[0];
            jewellery.dataValues.comboList = collectionAndCombo[1];
            res.setSuccess(jewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putJewelleryUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let jewellery = await Jewellery.findOne({
                where: {
                    productCode: id
                }
            });
            if (!jewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }
            let {
                designForm,
                diamondSize,
                hasDiamond,
                gemstone,
                goldProperty,
                price,
                extraProperties,
                mediafiles,
                bannerInfo,
                SEOInfo,
                keywords,
                desc,
                isShowOnWeb,
                shape,
                isHiddenPrice
            } = ctx.request.body;
            let updateInfo = {}
            if (designForm && designForm != jewellery.designForm) {
                updateInfo.designForm = designForm;
            }
            if (diamondSize && diamondSize != jewellery.diamondSize) {
                updateInfo.diamondSize = diamondSize;
            }
            if (hasDiamond && hasDiamond != jewellery.hasDiamond) {
                updateInfo.hasDiamond = hasDiamond;
            }
            if (gemstone && gemstone != jewellery.gemstone) {
                updateInfo.gemstone = gemstone;
            }
            if (goldProperty && goldProperty != jewellery.goldProperty) {
                updateInfo.goldProperty = goldProperty;
            }
            if (price && price != jewellery.price) {
                updateInfo.price = price;
            }
            if (isHiddenPrice != undefined && isHiddenPrice != jewellery.isHiddenPrice) {
                updateInfo.isHiddenPrice = isHiddenPrice;
                if (isHiddenPrice) updateInfo.price = null;
            }
            if (extraProperties && extraProperties != jewellery.extraProperties) {
                updateInfo.extraProperties = extraProperties;
            }
            if (mediafiles && mediafiles != jewellery.mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            if (bannerInfo && bannerInfo != jewellery.bannerInfo) {
                updateInfo.bannerInfo = bannerInfo;
            }
            if (SEOInfo && SEOInfo != jewellery.SEOInfo) {
                updateInfo.SEOInfo = SEOInfo;
            }
            if (keywords && keywords != jewellery.keywords) {
                updateInfo.keywords = keywords;
            }
            if (desc && desc != jewellery.desc) {
                updateInfo.desc = desc;
            }
            if (isShowOnWeb != undefined && isShowOnWeb != jewellery.isShowOnWeb) {
                updateInfo.isShowOnWeb = isShowOnWeb;
                if (isShowOnWeb) {
                    updateInfo.showOnWebTime = dayjs().format();
                }
            }
            if (shape && shape != jewellery.shape) {
                updateInfo.shape = shape;
            }

            jewellery = await jewellery.update(updateInfo);
            res.setSuccess(jewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putJewellerySerialUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let jewellerySerial = await JewellerySerial.findOne({
                where: {
                    serial: id,
                    type: JewellerySerial.TYPE.FAKE
                }
            });
            if (!jewellerySerial) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }
            let {
                designForm,
                diamondSize,
                hasDiamond,
                gemstone,
                goldProperty,
                price,
                size,
                extraProperties,
                gender,
                shape,
                status
            } = ctx.request.body;
            let updateInfo = {}
            if (designForm && designForm != jewellerySerial.designForm) {
                updateInfo.designForm = designForm;
            }
            if (diamondSize && diamondSize != jewellerySerial.diamondSize) {
                updateInfo.diamondSize = diamondSize;
            }
            if (hasDiamond && hasDiamond != jewellerySerial.hasDiamond) {
                updateInfo.hasDiamond = hasDiamond;
            }
            if (gemstone && gemstone != jewellerySerial.gemstone) {
                updateInfo.gemstone = gemstone;
            }
            if (goldProperty && goldProperty != jewellerySerial.goldProperty) {
                updateInfo.goldProperty = goldProperty;
            }
            if (price && price != jewellerySerial.price) {
                updateInfo.price = price;
            }
            if (extraProperties && extraProperties != jewellerySerial.extraProperties) {
                updateInfo.extraProperties = extraProperties;
            }
            if (shape && shape != jewellerySerial.shape) {
                updateInfo.shape = shape;
            }
            if (gender && gender != jewellerySerial.gender) {
                updateInfo.gender = gender;
            }
            if (size && size != jewellerySerial.size) {
                updateInfo.size = size;
            }
            if (status && status != jewellerySerial.status) {
                updateInfo.status = status;
            }

            jewellerySerial = await jewellerySerial.update(updateInfo);
            res.setSuccess(jewellerySerial, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putJewellerySerialUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteJewellerySerial = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let jewellerySerial = await JewellerySerial.findOne({
                where: {
                    serial: id,
                    type: JewellerySerial.TYPE.FAKE
                }
            });
            if (!jewellerySerial) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }
            await jewellerySerial.destroy();
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putJewellerySerialUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewellerySerialInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let jewellerySerial = await JewellerySerial.findOne({
                where: {
                    serial: id
                },
                include: [{
                    model: Jewellery,
                    required: true,
                    as: 'generalInfo'
                }]
            });
            if (!jewellerySerial) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }
            res.setSuccess(jewellerySerial, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putJewellerySerialUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postJewellerySerialCreate = async (ctx, next) => {
        try {
            let {
                serial,
                productOdooId,
                diamondSize,
                gemstone,
                goldProperty,
                hasDiamond,
                size,
                gender,
                extraProperties,
                price,
                status
            } = ctx.request.body;
            let check = await Promise.all([JewellerySerial.findOne({
                where: {
                    serial: serial
                }
            }), Jewellery.findOne({
                where: {
                    productOdooId: productOdooId
                }
            })]);
            if (check[0]) {
                res.setError(`Conflict`, Constant.instance.HTTP_CODE.Conflict, [{
                    field: 'serial'
                }]);
                return res.send(ctx);
            }
            if (!check[1]) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, [{
                    field: 'productOdooId'
                }]);
                return res.send(ctx);
            }

            let jewellerySerial = await JewellerySerial.create({
                serial,
                productOdooId,
                diamondSize,
                gemstone,
                goldProperty,
                hasDiamond,
                size,
                gender,
                extraProperties,
                price,
                status: status || JewellerySerial.STATUS.ACTIVE
            });
            res.setSuccess(jewellerySerial, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postJewellerySerialCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putJewelleryUpdateAll = async (ctx, next) => {
        try {
            let {
                mediafiles,
                bannerInfo,
                SEOInfo,
                keywords,
                desc,
                isShowOnWeb,
                forCategory,
                include,
                exclude
            } = ctx.request.body;
            let updateInfo = {}
            if (mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            if (bannerInfo) {
                updateInfo.bannerInfo = bannerInfo;
            }
            if (SEOInfo) {
                updateInfo.SEOInfo = SEOInfo;
            }
            if (keywords) {
                updateInfo.keywords = keywords;
            }
            if (desc) {
                updateInfo.desc = desc;
            }
            if (isShowOnWeb) {
                updateInfo.isShowOnWeb = isShowOnWeb;
            }

            let condition = {};
            if (forCategory) {
                if (forCategory.includes('-')) {
                    condition.category = Sequelize.literal(`'${removeAccent(forCategory.trim().toLowerCase())}' = ANY("productCategorySlug")`)
                } else
                    condition.category = Sequelize.literal(`'${forCategory}' = ANY("productCategory")`);
            }
            if (include) {
                condition.productCode = {
                    [Op.in]: include
                }
            }
            if (exclude) {
                condition.productCode = {
                    [Op.notIn]: exclude
                }
            }
            let x = await Jewellery.update(updateInfo, {
                where: condition
            });
            res.setSuccess(x, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putJewelleryUpdateAll ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
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
            Logger.error('getJewelleryCategoryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewelleryList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            let condition = {};
            let order = [
                ['productName', 'ASC']
            ];

            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'productCodeASC':
                        order = [
                            ['productCode', 'ASC']
                        ];
                        break;
                    case 'productCodeDESC':
                        order = [
                            ['productCode', 'DESC']
                        ];
                        break;
                    case 'productNameASC':
                        order = [
                            ['productName', 'ASC']
                        ];
                        break;
                    case 'productNameDESC':
                        order = [
                            ['productName', 'DESC']
                        ];
                        break;
                    case 'priceASC':
                        order = [
                            ['price', 'ASC NULLS FIRST']
                        ];
                        break;
                    case 'priceDESC':
                        order = [
                            ['price', 'DESC NULLS LAST']
                        ];
                        break;
                }
            }

            if (query.keyword) {
                let keyword = removeAccent(query.keyword).toLowerCase();
                condition = {
                    ...condition,
                    [Op.or]: [{
                            productCode: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            productName: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            mainCategory: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            gemstone: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            shape: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            goldProperty: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }
                    ]
                }
            }

            if (query.type) {
                condition.type = query.type
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

            if (query.isShowOnWeb != undefined) {
                condition.isShowOnWeb = query.isShowOnWeb == "true" ? true : false
            }

            let havingCondition = null;
            if (query.stockStatus != undefined) {
                havingCondition = Sequelize.literal(`COUNT("serialList"."serial") ${query.stockStatus == 1 ? ' > 0' : ' = 0'}`);
            }
            const pager = paging(query);
            let result = await Promise.all([query.stockStatus == undefined ? Jewellery.count({
                where: condition,
            }) : new Promise(async (res, rej) => {
                let x = await Promise.all([Jewellery.count({
                    where: condition,
                    include: [{
                        model: JewellerySerial,
                        as: 'serialList',
                        required: false,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    }],
                }), Jewellery.count({
                    where: condition,
                    include: [{
                        model: JewellerySerial,
                        as: 'serialList',
                        required: true,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    }],
                })]);
                if (query.stockStatus == 1) {
                    res(x[1]);
                } else res(x[0] - x[1]);
            }), Jewellery.findAll(Object.assign({
                where: condition,
                attributes: [
                    ['productCode', 'id'], 'productOdooId', 'productCode', 'productName', 'mainCategory', 'mediafiles', 'productCategory', 'price', 'type', 'totalViews', 'desc', [Sequelize.fn("COUNT", Sequelize.col(`"serialList"."serial`)), "inStockCount"], "isShowOnWeb", "createdAt"
                ],
                duplicate: false,
                include: [{
                        model: NewJewellery,
                        as: 'newProductInfo',
                        attributes: ['order']
                    },
                    {
                        model: JewellerySerial,
                        as: 'serialList',
                        required: false,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    },
                    {
                        model: Category,
                        as: 'categoryInfo',
                        required: false,
                        attributes: ["mediafiles"]
                    }
                ],
                subQuery: false,
                group: ['id', 'newProductInfo.productCode', 'Jewellery.productCode'],
                order: order,
                having: havingCondition
            }, pager)), Jewellery.count({}), Jewellery.count({
                where: {
                    isShowOnWeb: true
                }
            }), Jewellery.count({
                where: {
                    isShowOnWeb: false
                }
            })]);
            // Return list
            res.setSuccess({
                count: result[0],
                list: result[1],
                extraCount: {
                    totalCount: result[2],
                    totalShow: result[3],
                    totalHide: result[4]
                }
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getNewJewellery = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            let condition = {};
            let order = [
                [{
                    model: NewJewellery,
                    as: 'newProductInfo',
                }, 'order', 'ASC']
            ];

            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'productCodeASC':
                        order = [
                            ['productCode', 'ASC'],
                        ];
                        break;
                    case 'productCodeDESC':
                        order = [
                            ['productCode', 'DESC']
                        ];
                        break;
                    case 'productNameASC':
                        order = [
                            ['productName', 'ASC']
                        ];
                        break;
                    case 'productNameDESC':
                        order = [
                            ['productName', 'DESC']
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
                order.push([{
                    model: NewJewellery,
                    as: 'newProductInfo',
                }, 'order', 'ASC']);
            }

            if (query.keyword) {
                let keyword = removeAccent(query.keyword).toLowerCase();
                condition = {
                    ...condition,
                    [Op.or]: [{
                            productCode: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            productName: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            mainCategory: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            gemstone: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            shape: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            goldProperty: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }
                    ]
                }
            }

            if (query.type) {
                condition.type = query.type
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

            let havingCondition = null;
            if (query.stockStatus != undefined) {
                havingCondition = Sequelize.literal(`COUNT("serialList"."serial") ${query.stockStatus == 1 ? ' >= 1' : ' = 0'}`);
            }
            const pager = paging(query);
            let result = await Promise.all([query.stockStatus == undefined ? Jewellery.count({
                where: condition,
                include: [{
                    model: NewJewellery,
                    as: 'newProductInfo',
                    required: true
                }],
            }) : new Promise(async (res, rej) => {
                let x = await Promise.all([Jewellery.count({
                    where: condition,
                    include: [{
                        model: NewJewellery,
                        as: 'newProductInfo',
                        required: true,
                        attributes: ['order']
                    }, {
                        model: JewellerySerial,
                        as: 'serialList',
                        required: false,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    }],
                }), Jewellery.count({
                    where: condition,
                    include: [{
                        model: JewellerySerial,
                        as: 'serialList',
                        required: true,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    }, {
                        model: NewJewellery,
                        as: 'newProductInfo',
                        required: true,
                        attributes: ['order']
                    }],
                })]);
                if (query.stockStatus == 1) {
                    res(x[1]);
                } else res(x[0] - x[1]);
            }), Jewellery.findAll(Object.assign({
                where: condition,
                attributes: [
                    ['productCode', 'id'], 'productOdooId', 'productCode', 'productName', 'mainCategory', 'mediafiles', 'productCategory', 'price', 'type', 'totalViews', 'desc', [Sequelize.fn("COUNT", Sequelize.col(`"serialList"."serial`)), "inStockCount"]
                ],
                duplicate: false,
                include: [{
                        model: NewJewellery,
                        as: 'newProductInfo',
                        required: true,
                        attributes: ['order']
                    },
                    {
                        model: JewellerySerial,
                        as: 'serialList',
                        required: false,
                        where: {
                            type: JewellerySerial.TYPE.REAL
                        },
                        attributes: []
                    }
                ],
                subQuery: false,
                group: ['id', 'newProductInfo.productCode'],
                order: order,
                having: havingCondition
            }, pager)),Jewellery.count({
                include: [{
                    model: NewJewellery,
                    as: 'newProductInfo',
                    required: true,
                    attributes: ['order']
                }]
            }), Jewellery.count({
                where: {
                    isShowOnWeb: true
                },
                include: [{
                    model: NewJewellery,
                    as: 'newProductInfo',
                    required: true,
                    attributes: ['order']
                }]
            }), Jewellery.count({
                where: {
                    isShowOnWeb: false
                },
                include: [{
                    model: NewJewellery,
                    as: 'newProductInfo',
                    required: true,
                    attributes: ['order']
                }]
            })]);
            // Return list
            res.setSuccess({
                count: result[0],
                list: result[1],
                extraCount: {
                    totalCount: result[2],
                    totalShow: result[3],
                    totalHide: result[4]
                }
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getNewJewellery ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewellerySerialList = async (ctx, next) => {
        try {
            // get current user
            const query = ctx.request.query;
            // Query
            let condition = {}
            let conditionJewellery;
            if (query.serial) {
                condition.serial = {
                    [Op.iLike]: `%${serial}%`
                }
            }

            if (query.productCode) {

                conditionJewellery = {
                    productCode: query.productCode
                }
            }
            if (query.category) {
                if (!conditionJewellery) conditionJewellery = {}
                if (query.category.includes('-')) {
                    conditionJewellery.category = Sequelize.literal(`'${removeAccent(query.category.trim().toLowerCase())}' = ANY("productCategorySlug")`)
                } else
                    conditionJewellery.category = Sequelize.literal(`'${query.category}' = ANY("productCategory")`);
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

            if (query.type) {
                if (!conditionJewellery) conditionJewellery = {}
                conditionJewellery.type = query.type
            }

            if (query.stockId) {
                condition.stockId = query.stockId
            }

            if (query.status) {
                condition.status = query.status
            }

            let order = [
                ['stockId', 'DESC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'stockIdDESC':
                        order = [
                            ['stockId', 'DESC']
                        ];
                        break;
                    case 'stockIdASC':
                        order = [
                            ['stockId', 'ASC']
                        ];
                        break;
                }
            }

            if (query.stockStatus !== undefined)
            {
                if (query.stockStatus == 1)
                {
                    condition.status = 1;
                    condition.type = JewellerySerial.TYPE.REAL
                }
                else
                {
                    Object.assign(condition,{
                        [Op.not]:{
                            status: 1,
                            type: JewellerySerial.TYPE.REAL
                        }
                    })
                }
            }
            console.log(condition)

            const pager = paging(query);
            let result = await JewellerySerial.findAndCountAll(Object.assign({
                where: condition,
                order: order,
                include: [{
                    model: Jewellery,
                    as: 'generalInfo',
                    required: conditionJewellery ? true : false,
                    where: conditionJewellery || {},
                    attributes: ['productCode', 'productName', 'productCategory', 'productCategorySlug', 'mainCategory', 'mediafiles'],
                }, {
                    model: Stock,
                    as: 'stockInfo',
                    required: false
                }]
            }, pager));
            // Return list
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewellerySerialList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
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
            Logger.error('getJewelleryCategoryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putJewelleryCategoryUpdate = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let category = await JewelleryCategory.findOne({
                where: {
                    id: id
                }
            })
            if (!category) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            let {
                size,
                defaultSize,
                calculateSize
            } = ctx.request.body;
            let updateInfo = {};
            if (size && size != category.size) {
                updateInfo.size = size;
            }
            if (defaultSize && defaultSize != category.defaultSize) {
                updateInfo.defaultSize = defaultSize;
            }
            if (calculateSize && calculateSize != category.calculateSize) {
                updateInfo.calculateSize = calculateSize;
            }
            category = await category.update(updateInfo);
            res.setSuccess(category, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putJewelleryCategoryUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }


    static postJewelleryNewOrder = async (ctx, next) => {
        let transaction;
        try {
            let {
                list
            } = ctx.request.body;
            // validate product
            let productCodeList = await Jewellery.findAll({
                where: {
                    productCode: list.map(e => e.productCode)
                }
            });
            if (productCodeList.length != list.length) {
                res.setError(`Bad request`, Constant.instance.HTTP_CODE.InternalError, [{
                    msg: "productCode not found"
                }]);
                return res.send(ctx);
            }
            transaction = await db.sequelize.transaction();
            for (let i of list) {
                let y = await NewJewellery.findOne({
                    where: {
                        productCode: i.productCode
                    }
                });
                if (y) {
                    await y.update({
                        order: i.order
                    }, {
                        transaction
                    });
                    continue;
                }
                // let x = await NewJewellery.findOne({
                //     where: {
                //         order: i.order
                //     }
                // });
                // if (x) await x.destroy({
                //     transaction
                // });
                await NewJewellery.create({
                    productCode: i.productCode,
                    order: i.order
                }, {
                    transaction
                })
            }
            await transaction.commit();
            res.setSuccess(null, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            if (transaction) await transaction.rollback();
            Logger.error('postJewelleryNewOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteNewProductOrder = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            // validate product
            await NewJewellery.destroy({
                where: {
                    productCode: id
                }
            })
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postJewelleryNewOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getListNewJewelleryOrder = async (ctx, next) => {
        try {
            const newProducts = await NewJewellery.findAll()
            res.setSuccess(newProducts, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListNewJewelleryOrder ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static exportJewelleryList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            let condition = {};
            let order = [
                ['productName', 'ASC']
            ];

            if (query.keyword) {
                let keyword = removeAccent(query.keyword).toLowerCase();
                condition = {
                    ...condition,
                    [Op.or]: [{
                            productCode: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            productName: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            mainCategory: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            gemstone: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            shape: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        },
                        {
                            goldProperty: {
                                [Op.iLike]: `%${keyword}%`
                            }
                        }
                    ]
                }
            }

            if (query.type) {
                condition.type = query.type
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

            if (query.isShowOnWeb != undefined) {
                condition.isShowOnWeb = query.isShowOnWeb == "true" ? true : false
            }

            let list = await Jewellery.findAll({
                where: condition,
                attributes: [
                    'productCode', 'productName', "isShowOnWeb", "isHiddenPrice"
                ],
            });
            const data = await csvConverter.json2csvAsync(list.map(e => {
                return {
                    productCode: e.productCode,
                    productName: e.productName,
                    isShowOnWeb: e.isShowOnWeb ? 1 : 0,
                    isHiddenPrice: e.isHiddenPrice ? 1 : 0
                }
            }));

            // Return list
            ctx.set('Content-disposition', 'attachment; filename=jewellery.csv');
            ctx.set('Content-Type', 'text/csv');
            ctx.body = data;
            return ctx;
        } catch (e) {
            Logger.error('getJewelleryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static importJewelleryList = async (ctx, next) => {
        try {
            await uploadSingle(ctx, next);
            let data = await csv().fromString(ctx.file.buffer.toString('utf-8'));
            const originalData = JSON.parse(JSON.stringify(data));
            let isFileWrongFormat = false;
            if (!data[0] || JSON.stringify(Object.keys(data[0]).sort()) != JSON.stringify(['isHiddenPrice', 'isShowOnWeb', 'productCode', 'productName'])) {
                isFileWrongFormat = true;
                console.log(Object.keys(data[0]).sort())
                res.setSuccess({
                    isFileWrongFormat: isFileWrongFormat,
                    message: `File header must have 'productCode', 'productName', 'isShowOnWeb', 'isHiddenPrice'`,
                    success: 0,
                    failed: data.length,
                });
                return res.send(ctx)
            }
            const checkExisted = await Jewellery.findAll({
                where: {
                    productCode: {
                        [Op.in]: data.map(e => e.productCode)
                    }
                },
                attributes: ['productCode']
            });
            const notFound = data.filter(e => !checkExisted.find(x => x.dataValues.productCode == e.productCode)).map(e => e.productCode);
            const wrongValue = data.filter(e => {
                return (e.isShowOnWeb != 1 && e.isShowOnWeb != 0) || (e.isHiddenPrice != 1 && e.isHiddenPrice != 0)
            }).map(e => e.productCode);
            data = data.filter(e => {

                return !(notFound.find(x => x == e.productCode) || wrongValue.find(x => x == e.productCode))
            });
            await Promise.all(data.map(async (jew) => {
                await Jewellery.update({
                    isShowOnWeb: parseInt(jew.isShowOnWeb) == 1 ? true : false,
                    isHiddenPrice: parseInt(jew.isHiddenPrice) == 1 ? true : false,
                }, {
                    where: {
                        productCode: jew.productCode
                    }
                })
            }))
            res.setSuccess({
                isFileWrongFormat: isFileWrongFormat,
                success: data.length,
                failed: notFound.length + wrongValue.length,
                notFound: notFound.map(e => {
                    return {
                        productCode: e,
                        line: originalData.findIndex(x => x.productCode == e) + 2
                    }
                }),
                wrongValue: wrongValue.map(e => {
                    return {
                        productCode: e,
                        line: originalData.findIndex(x => x.productCode == e) + 2
                    }
                }),
                message: `Success: ${data.length} Failed: ${notFound.length + wrongValue.length}`
            });
            return res.send(ctx)
        } catch (e) {
            Logger.error('getJewelleryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}