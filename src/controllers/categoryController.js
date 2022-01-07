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
    Category
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

export default class CategoryController {
    // Get category list with all subitems

    static getCategoryListTree = async (ctx, next) => {
        try {
            let categoryList = await Category.findAll({
                raw: true
            });
            let list = categoryList.filter(e => !e.parentId);
            categoryList = categoryList.filter(e => e.parentId);
            for (let mainCategory of list) {
                let result = recusive(mainCategory, categoryList);
                mainCategory = result.value;
                categoryList = result.list;
            }
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCategoryListTree ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCategoryList = async (ctx, next) => {
        try {
            let categoryList = await Category.findAll({});
            // Return info
            res.setSuccess(categoryList, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCategoryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putCategoryUpdate = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let category = await Category.findOne({
                where: {
                    id: id
                }
            });
            if (!category) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            const {
                name,
                parentId,
                desc,
                link,
                mediafiles,
                meta,
                status,
                type
            } = ctx.request.body;
            let updateInfo = {};
            if (name && name != category.name) {
                updateInfo.name = name;
            }
            if (parentId && parentId != category.parentId) {
                let parent = await Category.findOne({
                    where: {
                        id: parentId
                    }
                });
                if (!parent) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
                updateInfo.parentId = parentId;
            }
            if (desc && desc != category.desc) {
                updateInfo.desc = desc;
            }
            if (link && link != category.link) {
                updateInfo.link = link;
            }
            if (mediafiles && mediafiles != category.mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            if (meta && meta != category.meta) {
                updateInfo.meta = meta;
            }
            if (status && status != category.status) {
                updateInfo.status = status;
            }
            if (type && type != category.type) {
                updateInfo.type = type;
            }
            category = await category.update(updateInfo);
            // Return info
            res.setSuccess(category, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putCategoryUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static postCategoryCreate = async (ctx, next) => {
        try {
            const {
                name,
                parentId,
                desc,
                link,
                mediafiles,
                meta,
                status,
                type
            } = ctx.request.body;
            if (parentId) {
                let parent = await Category.findOne({
                    where: {
                        id: parentId
                    }
                });
                if (!parent) {
                    res.setError(`parentId ${parentId} Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                    return res.send(ctx);
                }
            }
            let category = await Category.create({
                name,
                parentId,
                desc,
                link,
                mediafiles,
                meta,
                status,
                type
            });
            res.setSuccess(category, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCategoryCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }

    }

    static deleteCategory = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let category = await Category.findOne({
                where: {
                    id: id
                }
            });
            if (!category) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            await Category.destroy({
                where: {
                    id: id
                }
            })
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteCategory ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCategoryInfo = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            let category = await Category.findOne({
                where: {
                    id: id
                }
            });
            if (!category) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }
            res.setSuccess(category, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCategoryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}