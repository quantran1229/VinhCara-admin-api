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
import {
    StoreContact,
    Location,
    Stock
} from '../models';
import {
    paging
} from '../utils/utils'
import {isEqual} from 'lodash'

const res = new Response();
export default class StoreContactController {
    static getStoreContactInfo = async (ctx, next) => {
        try {
            let {
                id
            } = ctx.request.params
            let respStoreContact = await StoreContact.findOne({
                where: {
                    id: id
                },
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
                    },
                    {
                        model: Stock,
                        as: 'stockInfo',
                        attributes: ['id', 'name']
                    }
                ],
            })
            if (!respStoreContact) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(respStoreContact, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getStoreContactInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    //get list, filter support (oderBy: id, name; name, status)
    static async getList(ctx, next) {
        try {
            const {
                query
            } = ctx.request;
            const condition = {};

            if (query.name) {
                query.name = removeAccent(query.name)
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('name')), {
                    [Op.iLike]: `%${query.name}%`
                });
            }

            if (query.providenceId) {
                condition.providenceId = query.providenceId;
            }

            if (query.cityId) {
                condition.cityId = query.cityId;
            }

            const pager = paging(query);
            const result = await StoreContact.findAndCountAll(Object.assign({
                where: condition,
                order: [
                    ['id', 'ASC']
                ],
                attributes: ['id', 'name', 'openTime', 'phone', 'stockId', 'address', 'providenceId',
                    'cityId', 'districtId', 'mediafiles', 'directionLink', 'meta'
                ],
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
                    },
                    {
                        model: Stock,
                        as: "stockInfo",
                        attributes: ['id', 'name']
                    }
                ],
            }, pager));
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static postCreateStoreContact = async (ctx, next) => {
        try {
            const {
                name,
                openTime,
                phone,
                stockId,
                providenceId,
                cityId,
                districtId,
                address,
                status,
                meta,
                mediafiles,
                directionLink
            } = ctx.request.body;
            let stock = await Stock.findOne({
                where: {
                    id: stockId
                }
            })
            if(!stock) {
                res.setError(`Stock ${stockId} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let resultCreateStoreContact = await StoreContact.create({
                name,
                openTime,
                phone,
                stockId,
                providenceId,
                cityId,
                districtId,
                address,
                status: status ? status : StoreContact.STATUS.ACTIVE,
                meta,
                mediafiles,
                directionLink
            })
            let storeContact = await StoreContact.findOne({
                where: {
                    id: resultCreateStoreContact.id
                },
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
                    },
                    {
                        model: Stock,
                        as: "stockInfo",
                        attributes: ['id', 'name']
                    }
                ],
            })
            res.setSuccess(storeContact, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateStoreContact ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static putUpdateStoreContact = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            const {
                name,
                openTime,
                phone,
                stockId,
                providenceId,
                cityId,
                districtId,
                address,
                status,
                meta,
                mediafiles,
                directionLink
            } = ctx.request.body;
            let updateInfo = {}
            let storeContactOld = await StoreContact.findOne({
                where: {
                    id: id
                }
            })
            if(!storeContactOld) {
                res.setError(`Store Contact ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if(stockId && stockId !== storeContactOld.stockId) {
                let stock = await Stock.findOne({
                    where: {
                        id: stockId
                    }
                })
                if(!stock) {
                    res.setError(`Stock ${stockId} not found`, Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
                updateInfo.stockId = stockId
            }
            if(name && name !== storeContactOld.name) {
                updateInfo.name = name
            }
            if(openTime && !isEqual(openTime.sort(),storeContactOld.openTime.sort())) {
                updateInfo.openTime = openTime
            }
            if(phone && !isEqual(phone.sort(),storeContactOld.phone.sort())) {
                updateInfo.phone = phone
            }
            if(providenceId && providenceId !== storeContactOld.providenceId) {
                updateInfo.providenceId = providenceId
            }
            if(cityId && cityId !== storeContactOld.cityId) {
                updateInfo.cityId = cityId
            }
            if(districtId && districtId !== storeContactOld.districtId) {
                updateInfo.districtId = districtId
            }
            if(address && address !== storeContactOld.address) {
                updateInfo.address = address
            }
            if(status && status !== storeContactOld.status) {
                updateInfo.status = status
            }
            if(meta && !isEqual(meta,storeContactOld.meta)) {
                updateInfo.meta = meta
            }
            if(mediafiles && !isEqual(mediafiles,storeContactOld.mediafiles)) {
                updateInfo.mediafiles = mediafiles
            }
            if(directionLink && directionLink !== storeContactOld.directionLink) {
                updateInfo.directionLink = directionLink
            }
            await StoreContact.update(updateInfo, {
                where: {
                    id: id
                }
            })
            let storeContact = await StoreContact.findOne({
                where: {
                    id: id
                },
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
                    },
                    {
                        model: Stock,
                        as: "stockInfo",
                        attributes: ['id', 'name']
                    }
                ],
            })
            res.setSuccess(storeContact, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateStoreContact ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static deleteStoreContact = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            let storeContactOld = await StoreContact.findOne({
                where: {
                    id: id
                }
            })
            if(!storeContactOld) {
                res.setError(`Store Contact ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await StoreContact.destroy({
                where: {
                    id: id
                }
            })
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteStoreContact ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}