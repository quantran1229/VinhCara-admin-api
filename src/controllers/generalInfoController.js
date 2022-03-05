import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize'
import db, {
    GeneralInfo
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';

const res = new Response();

export default class GeneralInfoController {
    static getGeneralInfoByType = async (ctx, next) => {
        try {
            const {
                type
            } = ctx.request.params;
            const respGeneralInfo = await GeneralInfo.getInfo(type);
            if (!respGeneralInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(respGeneralInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getGeneralInfoByType ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static getGeneralInfoAllList = async (ctx, next) => {
        try {
            const respGeneralInfoList = await GeneralInfo.getAll();
            // Return info
            res.setSuccess(respGeneralInfoList, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getGeneralInfoAllList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putGeneralInfoUpdate = async (ctx, next) => {
        try {
            const {
                type
            } = ctx.request.params;
            let respGeneralInfo = await GeneralInfo.findOne({
                where: {
                    id: type
                }
            });
            if (!respGeneralInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let {
                name,
                setting
            } = ctx.request.body;
            let updateInfo = {};
            if (name && name != respGeneralInfo.name) {
                updateInfo.name = name
            }
            if (setting && setting != respGeneralInfo.setting) {
                updateInfo.setting = setting
            }
            respGeneralInfo = await respGeneralInfo.update(updateInfo);
            // Return info
            res.setSuccess(respGeneralInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getGeneralInfoByType ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postGeneralInfoCreate = async (ctx, next) => {
        try {
            let {
                id,
                name,
                setting
            } = ctx.request.body;
            let generalInfo = await GeneralInfo.findOne({
                where: {
                    id: id
                }
            });
            if (generalInfo) {
                res.setError(`Duplicated id`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'id',
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                return res.send(ctx);
            }
           let respGeneralInfo = await GeneralInfo.create({
                id,
                name,
                setting
            });
            // Return info
            res.setSuccess(respGeneralInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postGeneralInfoCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteGeneralInfo = async (ctx, next) => {
        try {
            const {
                type
            } = ctx.request.params;
            let respGeneralInfo = await GeneralInfo.findOne({
                where: {
                    id: type
                }
            });
            if (!respGeneralInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await GeneralInfo.destroy({
                where: {
                    id: type
                }
            })
            // Return info
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteGeneralInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}