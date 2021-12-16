import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import cors from '@koa/cors';

import routers from './routes';

import {
    routerLog
} from './middlewares';

import Logger from './utils/logger';

import Response from './utils/response';

import Constant from './constants';

// Constant
const app = new Koa();
const res = new Response();

app
    .use(cors())
    .use(helmet())
    .use(
        bodyParser({
            // enableTypes: ["json"],
            // extendTypes: {
            //     json: ["application/json"],
            // },
            onerror: (err, ctx) => {
                res.setError("Body parse error", Constant.instance.HTTP_CODE.BodyParseError);
                return res.send(ctx);
            },
        })
    )
    .use(routerLog)
    .use(routers);

const server = app.listen(
    Constant.instance.APP_PORT || 3000, // Port default 3000
    Constant.instance.APP_HOST, // Host default localhost
    () => {
        Logger.info(`App run on ${Constant.instance.APP_HOST}:${Constant.instance.APP_PORT}`);
    }
);

module.exports = server;