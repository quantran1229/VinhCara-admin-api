import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    NotFoundLog
} from '../models';

const res = new Response();

export default class NotFoundController {
    static getList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.link) {
                condition.link = {
                    [Op.iLike]: `%${query.link}%`
                }
            }
            const notFoundLogs = await NotFoundLog.findAll({
                where: condition
            });

            // Return list
            res.setSuccess(notFoundLogs, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('not found list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}