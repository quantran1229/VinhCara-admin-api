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
    Membership,
    MembershipCustomer
} from '../models';

const res = new Response();

export default class MembershipController {
    // get list of membership
    static getMembershipList = async (ctx, next) => {
        try {
            let list = await Membership.findAll({
                attributes: ['id', 'name', 'point', 'percentDiscount','percentDiaDiscount']
            })
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getMembershipList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    // get customer membership
    static getCustomerMembership = async (ctx, next) => {
        try {
            const phone = ctx.request.params.id;
            let membershipInfo = await MembershipCustomer.findOne({
                where: {
                    phone: phone
                },
                attributes: ['customerCode', 'name', 'point', 'type'],
                include: [{
                    model: Membership,
                    as: 'membershipInfo',
                    attributes: ['id', 'name', 'percentDiscount','percentDiaDiscount']
                }]
            })
            if (!membershipInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(membershipInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCustomerMembership ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}