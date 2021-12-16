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
    Location
} from '../models';

const res = new Response();

export default class LocationController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getLoctationInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const location = await Location.getFullInfo(id);
            if (!location) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(location, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLoctationInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getLoctationList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.type) {
                condition.type = query.type;
            }
            if (query.parentId) {
                condition.parentId = query.parentId;
            }
            if (query.name) {
                query.name = removeAccent(query.name)
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('name')), {
                    [Op.iLike]: `%${query.name}%`
                });
            }
            const locations = await Location.findAll({
                where: condition,
                attributes: ["id", "type", "name"],
                order: [['id','ASC']]
            })

            // Return list
            res.setSuccess(locations, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLoctationList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}