import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize';
import dayjs from 'dayjs';
import db, {
    Coupon
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    paging
} from '../utils/utils'

const res = new Response();

export default class CouponController {
    static getCouponInfo = async (ctx, next) => {
        try {
            const {
                id
            } = ctx.request.params;
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

    static deleteCoupon = async (ctx, next) => {
        try {
            const {
                id
            } = ctx.request.params;
            const respCoupon = await Coupon.getInfo(id);
            if (!respCoupon) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await respCoupon.destroy();
            // Return info
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCoupon ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static async getListCoupon(ctx, next) {
        try {
            const {
                query
            } = ctx.request;
            const condition = {};
            if (query.couponType) {
                condition.couponType = query.couponType;
            }
            if (query.status) {
                condition.status = query.status;
            }
            const pager = paging(query);
            const [result,totalStatusCount] = await Promise.all([Coupon.getList(condition, pager),
            Coupon.findAll({
                attributes: [[Sequelize.literal('COUNT(*)'),"count"], "status"],
                group: ['status']
            })]);
            const extraCount = {
                extraCount: {
                    totalInactive: parseInt(totalStatusCount.find(e=> e.status == Coupon.STATUS.INACTIVE)?.dataValues.count || 0),
                    totalActive: parseInt(totalStatusCount.find(e=> e.status == Coupon.STATUS.ACTIVE)?.dataValues.count || 0),
                    totalStop: parseInt(totalStatusCount.find(e=> e.status == Coupon.STATUS.FINISHED)?.dataValues.count || 0) + parseInt(totalStatusCount.find(e=> e.status == Coupon.STATUS.STOP)?.dataValues.count || 0) ,
                }
            }
            res.setSuccess(Object.assign(result,extraCount), Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListCoupon ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static async postCouponCreate(ctx, next) {
        try {
            let user = ctx.state.user;
            let {
                code,
                type,
                customerId,
                gifts,
                status,
                startTime,
                endTime,
                userType,
                discountPrice,
                discountPercent,
                couponType,
                minimumRequirement,
                limit,
                desc,
                showValue,
                giftText
            } = ctx.request.body;

            // validate
            let checkCode = await Coupon.findOne({
                where: {
                    code: code
                }
            });
            if (checkCode) {
                res.setError(`Conflict`, Constant.instance.HTTP_CODE.Conflict, [{
                    field: 'code',
                    code: 'conflicted'
                }]);
                return res.send(ctx);
            }

            if (!gifts && !discountPercent && !discountPrice) {
                res.setError(`Need fields gifts or discount % or price`, Constant.instance.HTTP_CODE.BadRequest, [{
                    field: 'code',
                    code: 'conflicted'
                }]);
                return res.send(ctx);
            }

            if (!status) {
                status = Coupon.STATUS.INACTIVE;
            }
            if (startTime && dayjs().isAfter(dayjs(startTime))) {
                status = Coupon.STATUS.ACTIVE;
            }
            if (!type) {
                type = Coupon.TYPE.PUBLIC;
                customerId = null;
            }
            if (type == Coupon.TYPE.PRIVATE) {
                if (!customerId) {
                    res.setError(`Missing fields`, Constant.instance.HTTP_CODE.BadRequest, [{
                        field: 'customerId',
                        code: 'missing fields'
                    }]);
                    return res.send(ctx);
                }
            }
            if (!limit) {
                limit = 0;
            }
            let coupon = await Coupon.create({
                code,
                type,
                customerId,
                gifts,
                status,
                startTime: dayjs(startTime),
                endTime: dayjs(endTime),
                createdBy: user.id,
                userType,
                discountPrice,
                discountPercent,
                couponType,
                minimumRequirement,
                limit,
                desc,
                showValue,
                meta: {},
                count: 0,
                giftText
            });

            res.setSuccess(coupon, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCouponCreate ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static async putCouponUpdate(ctx, next) {
        try {
            const {
                id
            } = ctx.request.params;
            const respCoupon = await Coupon.getInfo(id);
            if (!respCoupon) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let {
                code,
                type,
                customerId,
                gifts,
                status,
                startTime,
                endTime,
                userType,
                discountPrice,
                discountPercent,
                couponType,
                minimumRequirement,
                limit,
                desc,
                showValue,
                giftText
            } = ctx.request.body;

            let updateInfo = {}
            if (code && code != respCoupon.code) {
                let checkCode = await Coupon.findOne({
                    where: {
                        code: code,
                        id: {
                            [Op.not]: respCoupon.id
                        }
                    }
                });
                if (checkCode) {
                    res.setError(`Conflict`, Constant.instance.HTTP_CODE.Conflict, [{
                        field: 'code',
                        code: 'conflicted'
                    }]);
                    return res.send(ctx);
                }
                updateInfo.code = code;
            }
            if (type && type != respCoupon.type) {
                updateInfo.type = type;
            }
            if (customerId && customerId != respCoupon.customerId) {
                updateInfo.customerId = customerId;
            }
            if (gifts && gifts != respCoupon.gifts) {
                updateInfo.gifts = gifts;
            }
            if (status && status != respCoupon.status) {
                updateInfo.status = status;
            }
            if (startTime && startTime != respCoupon.startTime) {
                updateInfo.startTime = startTime;
                if (status == Coupon.STATUS.INACTIVE && dayjs().isAfter(dayjs(startTime)) && updateInfo.status) {
                    updateInfo.status = Coupon.STATUS.ACTIVE;
                }
            }
            if (endTime != undefined && endTime != respCoupon.endTime) {
                updateInfo.endTime = endTime;
                if (endTime && status == Coupon.STATUS.ACTIVE && dayjs().isAfter(dayjs(endTime)) && updateInfo.status) {
                    updateInfo.status = Coupon.STATUS.FINISHED;
                }
            }
            if (userType && userType != respCoupon.userType) {
                updateInfo.userType = userType;
            }
            if (discountPrice && discountPrice != respCoupon.discountPrice) {
                updateInfo.discountPrice = discountPrice;
            }
            if (discountPercent && discountPercent != respCoupon.discountPercent) {
                updateInfo.discountPercent = discountPercent;
            }
            if (couponType && couponType != respCoupon.couponType) {
                updateInfo.couponType = couponType;
            }
            if (minimumRequirement && minimumRequirement != respCoupon.minimumRequirement) {
                updateInfo.minimumRequirement = minimumRequirement;
            }
            if (limit && limit != respCoupon.limit) {
                updateInfo.limit = limit;
            }
            if (desc && desc != respCoupon.desc) {
                updateInfo.desc = desc;
            }
            if (showValue && showValue != respCoupon.showValue) {
                updateInfo.showValue = showValue;
            }

            if (giftText != undefined && giftText != respCoupon.giftText) {
                updateInfo.giftText = giftText;
            }

            let coupon = await respCoupon.update(updateInfo);

            res.setSuccess(coupon, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCouponCreate ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}