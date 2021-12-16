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

}