import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import db, {
    LuxuryJewellery,
    Jewellery
} from '../models';

const res = new Response();

export default class LuxuryJewelleryController {
    static getLuxuryJewelleryInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const luxuryJewellery = await LuxuryJewellery.findOne({
                where: condition,
                include: [{
                    model: Jewellery,
                    as: 'jewelleryInfo',
                    required: false
                }]
            });
            if (!luxuryJewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(luxuryJewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLuxuryJewelleryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getLuxuryJewelleryList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.gender) {
                condition.gender = query.gender;
            }
            let list = await LuxuryJewellery.findAll({
                where: condition,
                attributes: {
                    exclude: ['blocks']
                }
            });
            // Return list
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLuxuryJewelleryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}