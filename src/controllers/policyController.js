import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Op,
    Sequelize
} from 'sequelize';
import db, {
    Policy
} from '../models';

const res = new Response();

export default class PolicyController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getPolicyInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const policy = await Policy.findOne({
                where: condition
            });
            if (!policy) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(policy, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPolicyInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getPolicyList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};

            const policies = await Policy.findAll({
                where: condition,
                attributes: ["id", "preview", "name", "mediafiles", "slug"],
                order: [
                    ['id', 'ASC']
                ]
            })

            // Return list
            res.setSuccess(policies, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPolicyList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}