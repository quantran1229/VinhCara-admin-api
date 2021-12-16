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
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const id = ctx.request.params.id;
            let resultFromDatabase = await Promise.all([DiamondSerial.getInfo(id, user ? user.id : null), StoreContact.findAll({
                attributes: ['id', 'name', 'openTime', 'phone', 'mediafiles', 'stockId'],
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
            })])
            let diamond = resultFromDatabase[0];
            if (!diamond) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if (diamond.type == DiamondSerial.TYPE.REAL) {
                diamond.dataValues.inStoreList = resultFromDatabase[1].filter(e => e.stockId == diamond.stockId);
            }
            // Return info
            res.setSuccess(diamond, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getDiamondList = async (ctx, next) => {
        try {
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
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
            let result = await DiamondSerial.getList(condition, pager, order, user ? user.id : null);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDiamondList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getJewelleryForDiamonds = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let diamond = await DiamondSerial.findOne({
                where: {
                    serial: id
                }
            });
            if (!diamond) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let {
                gender,
                category
            } = ctx.request.query;
            let condition = {
                type: {
                    [Op.not]: Jewellery.TYPE.DOUBLE // K recomend Sản phẩm đôi
                },
                shape: diamond.shape,
                diamondSize: {
                    [Op.between]: [parseFloat(diamond.size) - 0.5, parseFloat(diamond.size) + 0.5]
                },
                hasDiamond: {
                    [Op.gt]: 0
                }
            };
            if (gender == "Nam") {
                condition.productCategory = Sequelize.literal(`'Sản phẩm nam' = ANY("productCategory")`);
            }
            if (gender == "Nữ") {
                condition.productCategory = Sequelize.literal(`'Sản phẩm nữ' = ANY("productCategory")`);
            }

            if (category) {
                category = removeAccent(category);
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('mainCategory')), {
                    [Op.iLike]: `%${category}%`
                });
            }

            let includeWishlist = null;
            if (ctx.state.user) {
                includeWishlist = [{
                    model: WishlistLog,
                    required: false,
                    where: {
                        customerId: ctx.state.user.id,
                        isCurrent: true,
                        status: WishlistLog.STATUS.LIKE,
                    },
                    as: 'wishlistInfo',
                    attributes: [
                        ['status', 'isLiked']
                    ]
                }]
            }
            let list = await Jewellery.findAll({
                where: condition,
                include: includeWishlist,
                order: [
                    ['totalOrders', 'ASC'],
                    ['totalViews', 'ASC']
                ],
                attributes: [
                    ['productCode', 'id'], 'productCode', 'type', 'mediafiles', 'productName', 'mainCategory', 'productCategory', 'price', 'totalViews', 'totalOrders'
                ],
            })
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getJewelleryForDiamonds ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCountJewelleryForDiamonds = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let diamond = await DiamondSerial.findOne({
                where: {
                    serial: id
                }
            });
            if (!diamond) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let condition = {
                type: {
                    [Op.not]: Jewellery.TYPE.DOUBLE // K recomend Sản phẩm đôi
                },
                shape: diamond.shape,
                diamondSize: {
                    [Op.between]: [parseFloat(diamond.size) - 0.5, parseFloat(diamond.size) + 0.5]
                },
                hasDiamond: {
                    [Op.gt]: 0
                }
            };

            let count = await Jewellery.findAll({
                raw: true,
                where: condition,
                attributes: [
                    [Sequelize.fn("COUNT", "*"), 'count'], 'mainCategory', [Sequelize.literal(`"productCategory"[2]`), "gender"]
                ],
                group: ['mainCategory', Sequelize.literal(`"productCategory"[2]`)]
            });
            let result = {
                all: {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam"
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ"
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                },
                "Nhẫn": {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam" && e.mainCategory && e.mainCategory.toLowerCase().includes("nhẫn");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ" && e.mainCategory && e.mainCategory.toLowerCase().includes("nhẫn");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                },
                "Bông tai": {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam" && e.mainCategory && e.mainCategory.toLowerCase().includes("bông tai");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ" && e.mainCategory && e.mainCategory.toLowerCase().includes("bông tai");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                },
                "Dây chuyền": {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam" && e.mainCategory && e.mainCategory.toLowerCase().includes("dây");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ" && e.mainCategory && e.mainCategory.toLowerCase().includes("dây");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                },
                "Lắc": {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam" && e.mainCategory && e.mainCategory.toLowerCase().includes("lắc");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ" && e.mainCategory && e.mainCategory.toLowerCase().includes("lắc");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                },
                "Vòng": {
                    "Nam": count.filter(e => {
                        return e.gender == "Sản phẩm nam" && e.mainCategory && e.mainCategory.toLowerCase().includes("vòng");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0),
                    "Nữ": count.filter(e => {
                        return e.gender == "Sản phẩm nữ" && e.mainCategory && e.mainCategory.toLowerCase().includes("vòng");
                    }).reduce((r, e) => {
                        return r + parseInt(e.count);
                    }, 0)
                }
            }
            // Return info
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCountJewelleryForDiamonds ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}