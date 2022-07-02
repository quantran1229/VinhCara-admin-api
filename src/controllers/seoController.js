import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    SEO
} from '../models';
import {
    v4 as uuid
} from 'uuid';

const res = new Response();

export default class RedirectController {
    static postCreate = async (ctx, next) => {
        try {
            const {
                name,
                title,
                desc
            } = ctx.request.body;
            const seo = await SEO.create({
                name,
                title,
                desc
            })
            res.setSuccess(seo, Constant.instance.HTTP_CODE.Created, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('SEO ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const seo = await SEO.findOne({
                where: {
                    id: id
                }
            });
            if (!seo) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(seo, Constant.instance.HTTP_CODE.Success, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('get SEO info ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.name) {
                condition.name = {
                    [Op.iLike]: `%${query.name}%`
                }
            }
            const seo = await SEO.findAll({
                where: condition,
                order: [['id','ASC']]
            });

            // Return list
            res.setSuccess(seo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('get SEO list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let seo = await SEO.findOne({
                where: {
                    id: id
                }
            });
            if (!seo) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                name,
                title,
                desc
            } = ctx.request.body;
            seo = await seo.update({
                name: name || seo.name,
                title: title || seo.title,
                desc: desc || seo.desc
            })

            res.setSuccess(seo, Constant.instance.HTTP_CODE.Success, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('put SEO ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static delete = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const seo = await SEO.findOne({
                where: {
                    id: id
                }
            });
            if (!seo) {
                res.setError('Not found', Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await seo.destroy();
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent, null);
            return res.send(ctx);
        } catch (e) {
            Logger.error('delete SEO ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}