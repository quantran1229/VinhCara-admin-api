import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Redirect
} from '../models';
import {
    v4 as uuid
} from 'uuid';

const res = new Response();

export default class RedirectController {
    static postCreate = async (ctx, next) => {
        try {
            const {
                from,
                to
            } = ctx.request.body;
            const redirect = await Redirect.create({
                id: uuid(),
                from,
                to
            })
            res.setSuccess(redirect, Constant.instance.HTTP_CODE.Created, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Redirect ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const redirect = await Redirect.findOne({
                id: id
            });
            if (!redirect) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(redirect, Constant.instance.HTTP_CODE.Success, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('get redirect info ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.from) {
                condition.from = {
                    [Op.iLike]: `%${query.from}%`
                }
            }
            if (query.to) {
                condition.to = {
                    [Op.iLike]: `%${query.from}%`
                }
            }
            const redirects = await Redirect.findAll({
                where: condition,
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            // Return list
            res.setSuccess(redirects, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('get redirect list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let redirect = await Redirect.findOne({
                id: id
            });
            if (!redirect) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                from,
                to
            } = ctx.request.body;
            redirect = await redirect.update({
                from: from || redirect.from,
                to: to || redirect.to
            })

            res.setSuccess(redirect, Constant.instance.HTTP_CODE.Success, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('put redirect ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static delete = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const redirect = await Redirect.findOne({
                id: id
            });
            if (!redirect) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await redirect.destroy();
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('delete redirect ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}