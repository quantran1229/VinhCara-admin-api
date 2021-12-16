import Parameter from 'parameter';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
const res = new Response();

export default function (rule , options) {
    return async (ctx,next)=>{
        try {
            options = options ?? ['body'];
            const parameter = new Parameter({
                convert: true,
                validateRoot: true, // restrict the being validate value must be a object
            });
            let data = {} // default body
            if (options.includes('body')) {
                data = ctx.request.body;
                let error = parameter.validate(rule['body'], data);
                if (error && error.length > 0) {
                    res.setError(`Bad request`, Constant.instance.HTTP_CODE.BadRequest, error);
                    return res.send(ctx);
                }
            }
            if (options.includes('query')) {
                data = ctx.request.query;
                let error = parameter.validate(rule['query'], data);
                if (error && error.length > 0) {
                    res.setError(`Bad request`, Constant.instance.HTTP_CODE.BadRequest, error);
                    return res.send(ctx);
                }
            }
            if (options.includes('params')) {
                data = ctx.request.params;
                let error = parameter.validate(rule['params'], data);
                if (error && error.length > 0) {
                    res.setError(`Bad request`, Constant.instance.HTTP_CODE.BadRequest, error);
                    return res.send(ctx);
                }
            }
            // Continue to go next 
            await next();
        } catch (e) {
            Logger.error('validate ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}