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
            jewellery.dataValues.comboList = collectionAndCombo[0];
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
                shape
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
            if (isShowOnWeb && isShowOnWeb != jewellery.isShowOnWeb) {
                updateInfo.isShowOnWeb = isShowOnWeb;
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
            const condition = {};
            let order = [
                ['productName', 'ASC']
            ];

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
            const pager = paging(query);
            let result = await Promise.all([Jewellery.count({
                where: condition
            }), Jewellery.findAll(Object.assign({
                where: condition,
                attributes: [
                    ['productCode', 'id'], 'productCode', 'mainCategory', 'productCategory', 'price', 'type', [Sequelize.fn("COUNT", Sequelize.col(`"serialList"."serial`)), "inStockCount"]
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
                    }
                ],
                subQuery: false,
                group: ['id', 'newProductInfo.productCode']
            }, pager))]);
            // Return list
            res.setSuccess({
                count: result[0],
                list: result[1]
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
            Logger.error('getNewJewellery ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}