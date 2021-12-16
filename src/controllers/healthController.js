import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    secondToHumanValue,
    bytesToHumanValue
} from '../utils/utils';
import db from '../models';

const res = new Response();

export default class HealthController {
    // Check health, return memory usage + uptime + mediafile disk size
    static checkHealth = async (ctx, next) => {
        try {
            if (ctx.request.headers.api_key !== Constant.instance.HEALTH_CHECK_KEY) {
                res.setError(`Anauthourized`, Constant.instance.HTTP_CODE.Unauthorized, null);
                return res.send(ctx);
            }

            let memUsage = process.memoryUsage().rss;
            let databaseConnection = 0;
            
            try {
                await db.sequelize.authenticate();
                databaseConnection = 1;
            } catch (e) {
                Logger.error(e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            }
            // Check health
            res.setSuccess({
                status: "Running",
                memoryUsage: bytesToHumanValue(memUsage),
                upTime: secondToHumanValue(process.uptime()),
                databaseConnection: databaseConnection == 1 ? "Success" : "Failed"
            })
            return res.send(ctx);
        } catch (e) {
            Logger.error(e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}