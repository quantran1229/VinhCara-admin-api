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
    AttributeName
} from '../models';

const res = new Response();

export default class LocationController {
    // Check health, return memory usage + uptime + mediafile disk size

    static getAttributeNameList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.type) {
                condition.type = query.type;
            }
            const attributes = await AttributeName.findAll({
                where: condition,
                attributes: ["showName", "name", "desc"]
            })

            // Return list
            res.setSuccess(attributes, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getAttributeNameList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}