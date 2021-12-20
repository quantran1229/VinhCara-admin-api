import {BlogType} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';

const res = new Response();

export default class BLogTypeController {
    static async getListBlogTypes(ctx, next) {
        try {
            const result = await BlogType.findAll({})
            if (!result) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListBlogTypes ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}