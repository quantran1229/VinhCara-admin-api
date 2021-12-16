import dayjs from 'dayjs';
import Logger from '../utils/logger';

// Log middleware to show log(time, call, ...) at end of every finish route call
async function routeLog(ctx,next) {
    const startTime = dayjs().clone();
    let error = null;
    try {
        await next();
    } catch (e) {
        error = e;
    }
    const ms = dayjs().diff(startTime, 'ms');
    // Log request
    Logger.http(
        `${ctx.request.method.toUpperCase()}[${
      error ? error.status : ctx.response.status
    }] - ${ms}ms - ${ctx.request.url}`,
    );
    if (error !== null) {
        ctx.throw(error.status, error.message);
        Logger.error(error.message);
    }
}

export default routeLog;