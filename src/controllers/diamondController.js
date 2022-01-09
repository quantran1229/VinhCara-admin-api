import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Op,
    Sequelize
} from 'sequelize'
import db, {
    Diamond,
    DiamondSerial,
    Stock,
    StoreContact,
    Location,
    Jewellery
} from '../models';
import {
    remove as removeAccent
} from 'diacritics'
import {
    paging
} from '../utils/utils'

const res = new Response();

export default class DiamondsController {
    // Diamonds controller
    static getDiamondInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let diamond = await Diamond.findOne({
                where: {
                    productCode: id
                },
                include: [{
                    model: DiamondSerial,
                    as: 'serialList',
                    required: false
                }]
            })
            if (!diamond) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(diamond, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putDiamondUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let diamond = await Diamond.findOne({
                where: {
                    productCode: id
                }
            })
            if (!diamond) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let {
                bannerInfo,
                SEOInfo,
                mediafiles,
            } = ctx.request.body;
            let updateInfo = {}
            if (bannerInfo && bannerInfo != diamond.bannerInfo) {
                updateInfo.bannerInfo = bannerInfo;
            }
            if (SEOInfo && SEOInfo != diamond.SEOInfo) {
                updateInfo.SEOInfo = SEOInfo;
            }
            if (mediafiles && mediafiles != diamond.mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            diamond = await diamond.update(updateInfo);
            // Return info
            res.setSuccess(diamond, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putDiamondUpdateAll = async (ctx, next) => {
        try {
            let {
                bannerInfo,
                SEOInfo,
                mediafiles,
                include,
                exclude
            } = ctx.request.body;
            let updateInfo = {}
            if (bannerInfo) {
                updateInfo.bannerInfo = bannerInfo;
            }
            if (SEOInfo) {
                updateInfo.SEOInfo = SEOInfo;
            }
            if (mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            let condition = {};
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
            let result = await Diamond.update(updateInfo, {
                where: condition
            });
            // Return info
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            console.log(e)
            Logger.error('putDiamondUpdateAll ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getDiamondList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            let order = [];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'shapeASC':
                        order = [
                            ['shape', 'ASC']
                        ];
                        break;
                    case 'shapeDESC':
                        order = [
                            ['shape', 'DESC']
                        ];
                        break;
                    case 'sizeASC':
                        order = [
                            ['size', 'ASC']
                        ];
                        break;
                    case 'sizeDESC':
                        order = [
                            ['size', 'DESC']
                        ];
                        break;
                    case 'caraWeightASC':
                        order = [
                            ['caraWeight', 'ASC']
                        ];
                        break;
                    case 'caraWeightDESC':
                        order = [
                            ['caraWeight', 'DESC']
                        ];
                        break;
                    case 'colorASC':
                        order = [
                            ['color', 'ASC']
                        ];
                        break;
                    case 'colorDESC':
                        order = [
                            ['color', 'DESC']
                        ];
                        break;
                    case 'clarityASC':
                        order = [
                            ['clarity', 'ASC']
                        ];
                        break;
                    case 'clarityDESC':
                        order = [
                            ['clarity', 'DESC']
                        ];
                        break;
                    case 'cutASC':
                        order = [
                            ['cut', 'ASC']
                        ];
                        break;
                    case 'cutDESC':
                        order = [
                            ['cut', 'DESC']
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
            order.push(['type', 'ASC'])

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

            if (query.shape) {
                const list = query.shape.split(',');
                condition.shape = {
                    [Op.in]: list
                };
            }

            if (query.size) {
                const list = query.size.split(',');
                let value = [];
                for (let i of list) {
                    let current = i.split('-');
                    if (current.length == 1) {
                        value.push({
                            [Op.gt]: parseFloat(i)
                        })
                    } else {
                        value.push({
                            [Op.between]: [parseFloat(current[0]), parseFloat(current[1])]
                        })
                    }
                }
                condition.size = {
                    [Op.or]: value
                }
            }

            if (query.caraWeight) {
                const list = query.caraWeight.split(',');
                let value = [];
                for (let i of list) {
                    let current = i.split('-');
                    if (current.length == 1) {
                        value.push({
                            [Op.gt]: parseFloat(i)
                        })
                    } else {
                        value.push({
                            [Op.between]: [parseFloat(current[0]), parseFloat(current[1])]
                        })
                    }
                }
                condition.caraWeight = {
                    [Op.or]: value
                }
            }

            if (query.color) {
                const list = query.color.split(',');
                condition.color = {
                    [Op.in]: list
                };
            }

            if (query.clarity) {
                const list = query.clarity.split(',');
                condition.clarity = {
                    [Op.in]: list
                };
            }

            if (query.cut) {
                const list = query.cut.split(',');
                condition.cut = {
                    [Op.in]: list
                };
            }

            if (query.productCode) {
                const list = query.productCode.split(',');
                condition.productCode = {
                    [Op.in]: list
                }
            }

            const pager = paging(query);
            let result = await Diamond.findAndCountAll(Object.assign({
                where: condition,
                duplicate: false,
                attributes: [
                    ['productCode', 'id'], 'productCode', 'mediafiles', 'price', 'shape', [Sequelize.fn("COUNT", Sequelize.col(`"serialList"."serial`)), "inStockCount"]
                ],
                include: [{
                    model: DiamondSerial,
                    as: 'serialList',
                    required: false,
                    where: {
                        type: DiamondSerial.TYPE.REAL
                    },
                    attributes: ["serial"]
                }],
                subQuery: false,
                group: ['productCode', 'serialList.serial']
            }, pager));
            // Return list
            res.setSuccess({
                list: result.rows,
                count: result.count
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getDiamondSerialList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            let order = [];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'shapeASC':
                        order = [
                            ['shape', 'ASC']
                        ];
                        break;
                    case 'shapeDESC':
                        order = [
                            ['shape', 'DESC']
                        ];
                        break;
                    case 'sizeASC':
                        order = [
                            ['size', 'ASC']
                        ];
                        break;
                    case 'sizeDESC':
                        order = [
                            ['size', 'DESC']
                        ];
                        break;
                    case 'caraWeightASC':
                        order = [
                            ['caraWeight', 'ASC']
                        ];
                        break;
                    case 'caraWeightDESC':
                        order = [
                            ['caraWeight', 'DESC']
                        ];
                        break;
                    case 'colorASC':
                        order = [
                            ['color', 'ASC']
                        ];
                        break;
                    case 'colorDESC':
                        order = [
                            ['color', 'DESC']
                        ];
                        break;
                    case 'clarityASC':
                        order = [
                            ['clarity', 'ASC']
                        ];
                        break;
                    case 'clarityDESC':
                        order = [
                            ['clarity', 'DESC']
                        ];
                        break;
                    case 'cutASC':
                        order = [
                            ['cut', 'ASC']
                        ];
                        break;
                    case 'cutDESC':
                        order = [
                            ['cut', 'DESC']
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
            order.push(['type', 'ASC'])

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

            if (query.shape) {
                const list = query.shape.split(',');
                condition.shape = {
                    [Op.in]: list
                };
            }

            if (query.size) {
                const list = query.size.split(',');
                let value = [];
                for (let i of list) {
                    let current = i.split('-');
                    if (current.length == 1) {
                        value.push({
                            [Op.gt]: parseFloat(i)
                        })
                    } else {
                        value.push({
                            [Op.between]: [parseFloat(current[0]), parseFloat(current[1])]
                        })
                    }
                }
                condition.size = {
                    [Op.or]: value
                }
            }

            if (query.caraWeight) {
                const list = query.caraWeight.split(',');
                let value = [];
                for (let i of list) {
                    let current = i.split('-');
                    if (current.length == 1) {
                        value.push({
                            [Op.gt]: parseFloat(i)
                        })
                    } else {
                        value.push({
                            [Op.between]: [parseFloat(current[0]), parseFloat(current[1])]
                        })
                    }
                }
                condition.caraWeight = {
                    [Op.or]: value
                }
            }

            if (query.color) {
                const list = query.color.split(',');
                condition.color = {
                    [Op.in]: list
                };
            }

            if (query.clarity) {
                const list = query.clarity.split(',');
                condition.clarity = {
                    [Op.in]: list
                };
            }

            if (query.cut) {
                const list = query.cut.split(',');
                condition.cut = {
                    [Op.in]: list
                };
            }

            if (query.serial) {
                const list = query.serial.split(',');
                condition.serial = {
                    [Op.in]: list
                }
            }

            const pager = paging(query);
            let result = await DiamondSerial.findAndCountAll(Object.assign({
                where: condition,
                include: [{
                    model: Diamond,
                    as: 'generalInfo',
                    attributes: [
                        ['productCode', 'id'], 'productCode', 'mediafiles', 'price', 'shape'
                    ]
                }, {
                    model: Stock,
                    as: 'stockInfo',
                    required: false
                }],
            }, pager));
            // Return list
            res.setSuccess({
                list: result.rows,
                count: result.count
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}