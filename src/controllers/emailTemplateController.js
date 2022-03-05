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
    EmailTemplate
} from '../models';

const res = new Response();

export default class EmailTemplateController {

    static getListEmailTemplates = async (ctx, next) => {
        try {
            let emailTemplates = await EmailTemplate.findAll({
                attributes: ["id", "title"]
            });
            // Return info
            res.setSuccess(emailTemplates, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListEmailTemplates ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getEmailTemplateInfo = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            let emailTemplateInfo = await EmailTemplate.findOne({
                where: {
                    id: id
                }
            });
            if (!emailTemplateInfo) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(emailTemplateInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getEmailTemplateInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postEmailTemplateCreate = async (ctx, next) => {
        try {
            const { body, title } = ctx.request.body
            let resp = await EmailTemplate.create({
                body,
                title
            })
            // Return info
            res.setSuccess(resp, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postEmailTemplateCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putEmailTemplateUpdate = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            const { body, title } = ctx.request.body
            let emailTemplate = await EmailTemplate.findOne({
                where: {
                    id: id
                }
            })
            if (!emailTemplate) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            let updateInfo = {}
            if(body && body !== emailTemplate.body) {
                updateInfo.body = body
            }
            if(title && title !== emailTemplate.title) {
                updateInfo.title = title
            }
            const resp = await emailTemplate.update(updateInfo)
            // Return info
            res.setSuccess(resp, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putEmailTemplateUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteEmailTemplate = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            const { body, title } = ctx.request.body
            let emailTemplate = await EmailTemplate.findOne({
                where: {
                    id: id
                }
            })
            if (!emailTemplate) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            await EmailTemplate.destroy({
                where: {
                    id: id
                }
            })
            // Return info
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteEmailTemplate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}