import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize'
import db, {
    Coupon
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import { paging } from '../utils/utils'

const res = new Response();

export default class CouponController {
    static getCouponInfo = async (ctx, next) => {
        try {
            const { id } = ctx.request.params;
            const respCoupon = await Coupon.getInfo(id);
            if (!respCoupon) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(respCoupon, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCoupon ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async getListCoupon(ctx, next) {
        try {
            const {query} = ctx.request;
            const condition = {};
            if (query.type) {
                condition.type = query.type;
            }
            if (query.subType) {
                condition.subType = query.subType;
            }
            if (query.status) {
                condition.status = query.status;
            }
            const pager = paging(query);
            const result = await Coupon.findAndCountAll(Object.assign({
                where: condition,
                order: [
                    ['id', 'ASC']
                ],
            }, pager));
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListCoupon ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}