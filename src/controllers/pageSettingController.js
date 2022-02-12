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
    PageSetting
} from '../models';

const res = new Response();

export default class PageSettingController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getPageSettingInfo = async (ctx, next) => {
        try {
            const page = ctx.request.query.page;
            const setting = await PageSetting.findOne({
                where: {
                    link: page
                }
            });
            if (!setting) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(setting, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPageSettingInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getPageSettingList = async (ctx, next) => {
        try {
            const pages = await PageSetting.findAll();
            // Return list
            res.setSuccess(pages, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPageSettingList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putPageSettingInfo = async (ctx, next) => {
        try {
            const page = ctx.request.query.page;
            let pageSetting = await PageSetting.findOne({
                where: {
                    link: page
                }
            });
            if (!pageSetting) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            const {
                name,
                link,
                SEOInfo,
                setting,
                parentId,
                banner
            } = ctx.request.body;
            let updateInfo = {};
            if (name && name != pageSetting.name) {
                updateInfo.name = name
            }
            if (link && link != pageSetting.link) {
                let pageSettingLink = await PageSetting.findOne({
                    where: {
                        link: link
                    }
                });
                if (pageSettingLink) {
                    res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'link',
                    }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                    return res.send(ctx);
                }
                updateInfo.link = link
            }
            if (SEOInfo && SEOInfo != pageSetting.SEOInfo) {
                updateInfo.SEOInfo = SEOInfo
            }
            if (setting && setting != pageSetting.setting) {
                updateInfo.setting = setting
            }
            if (parentId && parentId != pageSetting.parentId) {
                let pageSettingParentId = await PageSetting.findOne({
                    where: {
                        id: parentId
                    }
                });
                if(!pageSettingParentId) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
                updateInfo.parentId = parentId
            }
            if (banner && banner != pageSetting.banner) {
                updateInfo.banner = banner
            }
            await PageSetting.update(updateInfo, {
                where: {
                    id: pageSetting.id
                }
            });
            pageSetting = await PageSetting.findOne({
                where: {
                    id: pageSetting.id
                }
            });
            // Return info
            res.setSuccess(pageSetting, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putPageSettingInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postPageSettingInfo = async (ctx, next) => {
        try {
            const {
                name,
                link,
                SEOInfo,
                setting,
                parentId,
                banner
            } = ctx.request.body;
            let pageSettingLink = await PageSetting.findOne({
                where: {
                    link: link
                }
            });
            if (pageSettingLink) {
                res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'link',
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                return res.send(ctx);
            }
            if(parentId)
            {
                let pageSettingParentId = await PageSetting.findOne({
                    where: {
                        id: parentId
                    }
                });
                if(!pageSettingParentId) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
            }
            let pageSetting = await PageSetting.create({
                name,
                link,
                SEOInfo,
                setting,
                parentId,
                banner
            });
            // Return info
            res.setSuccess(setting, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postPageSettingInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deletePageSettingInfo = async (ctx, next) => {
        try {
            const page = ctx.request.query.page;
            let pageSetting = await PageSetting.findOne({
                where: {
                    link: page
                }
            });
            if (!pageSetting) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await PageSetting.destroy({
                where: {
                    id: pageSetting.id
                }
            });
            // Return info
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deletePageSettingInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}