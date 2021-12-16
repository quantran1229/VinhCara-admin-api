import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';

import {
    Op,
    Sequelize
} from 'sequelize'
import {
    Collection,
    Jewellery
} from '../models';
import {
    paging
} from '../utils/utils'

const res = new Response();

export default class CollectionController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getCollectionInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let collection = await Collection.getInfo(id);

            if (!collection) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }

            res.setSuccess(collection, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCollectionInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCurrentCollection = async (ctx, next) => {
        try {
            let collection = await Collection.findOne({
                attributes:{
                    exclude: ['productCode']
                }
            });

            if (!collection) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }

            res.setSuccess(collection, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCurrentCollection ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCurrentCollectionJewelleryList = async (ctx, next) => {
        try {
            let user = null;
            if (ctx.state.user)
            {
                user = ctx.state.user;
            }
            let collection = await Collection.findOne({
                attributes:['productCode']
            });

            if (!collection) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }

            const query = ctx.request.query;
            // Query
            const condition = {
                productCode: {
                    [Op.in]: collection.productCode
                }
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
            let result = await Jewellery.getList(condition, pager, order, user ? user.id : null);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCurrentCollectionJewelleryList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    // static getCollectionJewelleryFilterList = async (ctx, next) => {
    //     try {
    //         let filterList = await Promise.all([
    //             Jewellery.findAll({
    //                 attributes: [
    //                     [Sequelize.fn('DISTINCT', Sequelize.col('designForm')), "designForm"]
    //                 ]
    //             }),
    //             Jewellery.findAll({
    //                 attributes: [
    //                     [Sequelize.fn('DISTINCT', Sequelize.col('diamondSize')), "diamondSize"]
    //                 ]
    //             }),
    //             Jewellery.findAll({
    //                 attributes: [
    //                     [Sequelize.fn('DISTINCT', Sequelize.col('gemstone')), "gemstone"]
    //                 ]
    //             })
    //         ])
    //         const filter = {
    //             designForm: filterList[0].map(e => e.designForm),
    //             diamondSize: filterList[1].map(e => e.diamondSize),
    //             gemstone: filterList[2].map(e => e.gemstone)
    //         }
    //         // Return list
    //         res.setSuccess(filter, Constant.instance.HTTP_CODE.Success);
    //         return res.send(ctx);

    //     } catch (e) {
    //         Logger.error(e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
    //         res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
    //         return res.send(ctx);
    //     }
    // }

    static getCollectionList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            let order = [
                ['createdAt', 'DESC']
            ];

            const pager = paging(query);
            let result = await Collection.getList(condition, pager, order);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCollectionList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCollectionJewelleryList = async (ctx, next) => {
        try {
            // get current user
            let user = null;
            if (ctx.state.user)
            {
                user = ctx.state.user;
            }
            const id = ctx.request.params.id;
            let collection = await Collection.getInfo(id,true);

            if (!collection) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
            }

            const query = ctx.request.query;
            // Query
            const condition = {
                productCode: {
                    [Op.in]: collection.productCode
                },
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
            let result = await Jewellery.getList(condition, pager, order, user ? user.id : null);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCollectionJewelleryList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}