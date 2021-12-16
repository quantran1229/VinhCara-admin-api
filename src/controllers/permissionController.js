import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import db, {
    Permission
} from '../models';

const res = new Response();

export default class PermissionController {
    static getPermissionInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const permission = await Permission.findOne({
                where: {
                    id: id
                }
            });
            if (!permission) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(permission, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPermissionInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getPermissionList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};

            const permissions = await Permission.findAll({
                where: condition,
                order: [
                    ['id', 'ASC']
                ]
            })

            // Return list
            res.setSuccess(permissions, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPermissionList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}