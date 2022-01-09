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
    Menu
} from '../models';

const res = new Response();


// recusive
let recusive = (x, list) => {
    x.subs = list.filter(e => e.parentId == x.id).sort((a, b) => a.id - b.id);
    list = list.filter(e => e.parentId != x.id);
    for (let sub of x.subs) {
        let result = recusive(sub, list);
        sub = result.value;
        list = result.list;
    }
    return {
        value: x,
        list: list
    };
}

export default class MenuController {
    // Get menu list with all subitems

    static getMenuTreeList = async (ctx, next) => {
        try {
            let menuList = await Menu.findAll({
                where: {},
                raw: true
            });
            let list = menuList.filter(e => !e.parentId);
            menuList = menuList.filter(e => e.parentId);
            for (let mainMenu of list) {
                let result = recusive(mainMenu, menuList);
                mainMenu = result.value;
                menuList = result.list;
            }
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getMenuTreeList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getMenuList = async (ctx, next) => {
        try {
            let menuList = await Menu.findAll();
            // Return info
            res.setSuccess(menuList, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getMenuList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putMenuUpdate = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let menu = await Menu.findOne({
                where: {
                    id: id
                }
            });
            if (!menu) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            const {
                link,
                meta,
                name,
                status,
                mediafile,
                parentId,
                type,
                buttonText,
                order
            } = ctx.request.body;
            let updateInfo = {};
            if (name && name != Menu.name) {
                updateInfo.name = name;
            }
            if (parentId && parentId != Menu.parentId) {
                let menuParentId = await Menu.findOne({
                    where: {
                        id: parentId
                    }
                });
                if(!menuParentId) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
                updateInfo.parentId = parentId;
            }
            if (buttonText && buttonText != Menu.buttonText) {
                updateInfo.buttonText = buttonText;
            }
            if (order && order != Menu.order) {
                updateInfo.order = order;
            }
            if (link && link != Menu.link) {
                let menuLink = await Menu.findOne({
                    where: {
                        link: link
                    }
                });
                if (menuLink) {
                    res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'link',
                    }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                    return res.send(ctx);
                }
                updateInfo.link = link;
            }
            if (mediafile && mediafile != Menu.mediafile) {
                updateInfo.mediafile = mediafile;
            }
            if (meta && meta != Menu.meta) {
                updateInfo.meta = meta;
            }
            if (status && status != Menu.status) {
                updateInfo.status = status;
            }
            if (type && type != Menu.type) {
                updateInfo.type = type;
            }
            menu = await menu.update(updateInfo);
            // Return info
            res.setSuccess(menu, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putCategoryUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postMenuCreate = async (ctx, next) => {
        try {
            const {
                link,
                meta,
                name,
                status,
                mediafile,
                parentId,
                type,
                buttonText,
                order
            } = ctx.request.body;
            let menuLink = await Menu.findOne({
                where: {
                    link: link
                }
            });
            if (menuLink) {
                res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'link',
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                return res.send(ctx);
            }
            if(parentId) {
                let menuParentId = await Menu.findOne({
                    where: {
                        id: parentId
                    }
                });
                if(!menuParentId) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
            }
            let menu = await Menu.create({
                link,
                meta,
                name,
                status,
                mediafile,
                parentId,
                type,
                buttonText,
                order
            });
            // Return info
            res.setSuccess(menu, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postMenuCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteMenu = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let menu = await Menu.findOne({
                where: {
                    id: id
                }
            });
            if (!menu) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            await Menu.destroy({
                where: {
                    id: id
                }
            })
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteMenu ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getMenuInfo = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let menu = await Menu.findOne({
                where: {
                    id: id
                }
            });
            if (!menu) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            res.setSuccess(menu, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getMenuInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}