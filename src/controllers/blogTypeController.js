import {
    BlogType,
    Blog
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    buildSlug
} from '../utils/utils'
import {
    Sequelize
} from 'sequelize'

const res = new Response();

export default class BLogTypeController {
    static async getListBlogTypes(ctx, next) {
        try {
            const {
                popular
            } = ctx.request.query
            if (popular) {
                const listType = await Blog.findAll({
                    attributes: ['type', Sequelize.literal(`COUNT('*')`)],
                    group: ['type'],
                    raw: true
                });
                let result = await BlogType.findAll({
                    include: [{
                        model: BlogType,
                        as: "subs",
                        attributes: ["name", "slug", "id"]
                    }],
                    where: {
                        parentId: null
                    }
                });
                result.forEach(e => {
                    e.dataValues.countBlogs = listType.find(x => x.type == e.id) ? parseInt(listType.find(x => x.type == e.id).count) : 0;
                    if (e.subs) {
                        let extraCount = 0;
                        e.subs.forEach(f => {
                            f.dataValues.countBlogs = listType.find(x => x.type == f.id) ? parseInt(listType.find(x => x.type == f.id).count) : 0;
                            extraCount += f.dataValues.countBlogs;
                        });
                        e.subs = e.subs.sort((a, b) => {
                            return - a.dataValues.countBlogs + b.dataValues.countBlogs;
                        })
                        e.dataValues.countBlogs += extraCount;
                    }
                });
                result = result.sort((a, b) => {
                    return - a.dataValues.countBlogs + b.dataValues.countBlogs;
                })
                res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            } else {
                const result = await BlogType.findAll({
                    include: [{
                        model: BlogType,
                        as: "subs",
                        attributes: ["name", "slug", "id"]
                    }],
                    where: {
                        parentId: null
                    },
                    order: [
                        ['id', 'ASC'],
                        [{
                                model: BlogType,
                                as: 'subs'
                            },
                            'id',
                            'ASC'
                        ]
                    ]
                });
                res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            }
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListBlogTypes ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async postCreateBlogType(ctx, next) {
        try {
            const {
                name,
                slug
            } = ctx.request.body;
            let checkDuplicateSlug = await BlogType.findOne({
                where: {
                    slug: buildSlug(slug)
                }
            })
            if (checkDuplicateSlug) {
                res.setError(`Duplicated slug`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'slug',
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                return res.send(ctx);
            }
            let blogType = await BlogType.create({
                name,
                slug: buildSlug(slug)
            })
            res.setSuccess(blogType, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateBlogType ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async putUpdateBlogType(ctx, next) {
        try {
            const {
                id
            } = ctx.request.params
            const {
                name,
                slug
            } = ctx.request.body;
            let updateInfo = {};
            let blogTypeOld = await BlogType.findOne({
                where: {
                    id: id
                }
            })
            if (!blogTypeOld) {
                res.setError(`BlogType ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if (name && name !== blogTypeOld.name) {
                updateInfo.name = name
            }
            if (slug && buildSlug(slug) !== blogTypeOld.slug) {
                let checkDuplicateSlug = await BlogType.findOne({
                    where: {
                        slug: buildSlug(slug)
                    }
                })
                if (checkDuplicateSlug) {
                    res.setError(`Duplicated slug`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'slug',
                    }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                    return res.send(ctx);
                }
                updateInfo.slug = buildSlug(slug)
            }
            await BlogType.update(updateInfo, {
                where: {
                    id: id
                },
            })
            let blogTypeNew = await BlogType.findOne({
                where: {
                    id: id
                }
            })
            res.setSuccess(blogTypeNew, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateBlogType ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async deleteBlogType(ctx, next) {
        try {
            const {
                id
            } = ctx.request.params;
            let blogType = await BlogType.findOne({
                where: {
                    id: id
                }
            })
            if (!blogType) {
                res.setError(`BlogType ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await BlogType.destroy({
                where: {
                    id: id
                }
            })
            res.setSuccess({
                deleted: true
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteBlogType ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}