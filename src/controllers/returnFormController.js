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
    ReturnForm,
    Order
} from '../models';

const res = new Response();

export default class LocationController {
    // Check health, return memory usage + uptime + mediafile disk size

    static postCreateNewReturnForm = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            let user = null;
            let sessionId = ctx.state.sessionId;
            if (ctx.state.user) {
                user = ctx.state.user;
            }
            const {
                name,
                phone,
                email,
                code,
                reason
            } = ctx.request.body;
            let order = await Order.findOne({
                where: {
                    code: code
                }
            });
            if (!order) {
                res.setError(`Order not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            if (!(order.customerId && user && user.id == order.customerId)) {
                res.setError(`Forbidden`, Constant.instance.HTTP_CODE.Forbidden, null, Constant.instance.ERROR_CODE.ORDER_NOT_BELONG_TO_USER);
                return res.send(ctx);
            }
            let returnForm = await ReturnForm.create({
                name,
                phone,
                email,
                orderId: order.id,
                reason,
                customerId: user ? user.id : null
            });
            res.setSuccess(returnForm, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateNewReturnForm ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}