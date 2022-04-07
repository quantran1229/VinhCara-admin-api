import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize,
    QueryTypes
} from 'sequelize'
import db, {
    Blog,
    BlogType,
    BlogToTag,
    Tag,
    User
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    paging
} from '../utils/utils'
import {
    buildSlug
} from '../utils/utils'
import dayjs from 'dayjs'
import {isEqual} from 'lodash'
import {request} from "chai";

const res = new Response();

export default class BLogController {
    static async getListBlogs(ctx, next) {
        try {
            const {
                query
            } = ctx.request;
            let condition = {};
            if (query.ids) {
                let listIdsAndSlugs = query.ids.split(',')
                let ids = listIdsAndSlugs.filter(id => !isNaN(id)).map(value => parseInt(value))
                let slugs = listIdsAndSlugs.filter(slug => isNaN(slug))
                condition = {
                    ...condition,
                    [Op.or]: [
                        {
                            id: {
                                [Op.in]: ids
                            },
                        },
                        {
                            slug: {
                                [Op.in]: slugs
                            }
                        }
                    ]
                }
            }
            if (query.name) {
                condition.title = {
                    [Op.iLike]: `%${query.name}%`
                }
            }
            if (query.type) {
                condition.type = query.type;
            }
            if (query.status) {
                condition.status = query.status;
            }
            if (query.dateFrom && query.dateTo) {
                condition.createdAt = {
                    [Op.between]: [dayjs(query.dateFrom, 'YYYYMMDD').startOf('day').toISOString(), dayjs(query.dateTo, 'YYYYMMDD').endOf('day').toISOString()],
                };
            }
            if (query.dateFrom && !query.dateTo) {
                condition.createdAt = {
                    [Op.gte]: dayjs(query.dateFrom, 'YYYYMMDD').startOf('day').toISOString()
                };
            }
            if (!query.dateFrom && query.dateTo) {
                condition.createdAt = {
                    [Op.lte]: dayjs(query.dateTo, 'YYYYMMDD').endOf('day').toISOString(),
                };
            }
            let categoryCondition = {}
            if (query.category) {
                categoryCondition.slug = query.category;
            }
            let tagCondition = {}
            if (query.tagId) {
                tagCondition.id = query.tagId;
            }
            let order = [
                ['publishAt', 'DESC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'publishAtDesc':
                        order = [
                            ['publishAt', 'DESC']
                        ];
                        break;
                    case 'publishAtAsc':
                        order = [
                            ['publishAt', 'ASC']
                        ];
                        break;
                }
            }
            const pager = paging(query);
            const result = await Blog.findAndCountAll(Object.assign({
                where: condition,
                order: order,
                attributes: ['id', 'type', 'title', 'slug', 'status', 'createdBy', 'createdAt', 'updatedAt', 'publishAt', 'seoInfo', 'mediaFiles', 'preview', 'publishAt'],
                include: [{
                    model: BlogType,
                    as: 'blogTypeInfo',
                    required: Object.keys(categoryCondition).length > 0 ? true : false,
                    attributes: ['id', 'name', 'slug'],
                    where: categoryCondition
                },
                    {
                        model: Tag,
                        as: 'tags',
                        required: Object.keys(tagCondition).length > 0 ? true : false,
                        where: tagCondition,
                        attributes: ['id', 'title', 'link']
                    }
                ]
            }, pager));
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListBlogs ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getBlogInfo = async (ctx, next) => {
        try {
            let {id} = ctx.request.params;
            let condition = {};
            if (!isNaN(id)) {
                // If id is number, search by id
                condition.id = id;
            } // else search the slug
            else {
                condition.slug = id;
            }
            let respBlogInfo = await Blog.findOne({
                where: condition,
                include: [{
                    model: BlogType,
                    as: 'blogTypeInfo',
                    attributes: ['id', 'name']
                },
                    {
                        model: Tag,
                        as: 'tags',
                        attributes: ['id', 'title', 'link']
                    }
                ],
            })
            if (!respBlogInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(respBlogInfo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getBlogInfo ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static postCreateNewBlog = async (ctx, next) => {
        try {
            const {
                type,
                title,
                slug,
                body,
                status,
                publishAt,
                seoInfo,
                mediaFiles,
                preview,
                tagIds
            } = ctx.request.body;

            let checkDuplicateSlug = await Blog.findOne({
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
            if (type) {
                let blogType = await BlogType.findOne({
                    where: {
                        id: type
                    }
                })
                if (!blogType) {
                    res.setError(`Blog Type ${type} not found`, Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
            }
            let notFoundTag = []
            for (const tagId of tagIds) {
                let tag = await Tag.findOne({
                    where: {
                        id: tagId
                    }
                })
                if (!tag) {
                    notFoundTag.push(tagId)
                }
            }
            if (notFoundTag.length > 0) {
                res.setError(`Tag ${notFoundTag.join(', ')} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let blog = await Blog.create({
                type,
                title,
                slug: buildSlug(slug),
                body,
                status: status ? status : Blog.STATUS.ACTIVE,
                publishAt,
                seoInfo,
                mediaFiles,
                preview,
                createdBy: ctx.state.user.id,
            });
            if (blog) {
                let listBlogToTags = await Promise.all(tagIds.map(async (tagId) => {
                    return BlogToTag.create({
                        blogId: blog.id,
                        tagId: tagId
                    })
                }))
            }
            let blogNew = await Blog.findOne({
                where: {
                    id: blog.id
                },
                include: [
                    {
                        model: Tag,
                        as: 'tags'
                    }
                ]
            })
            res.setSuccess(blogNew, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateNewBlog ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static putUpdateBlog = async (ctx, next) => {
        try {
            const {id} = ctx.request.params
            const {type, title, slug, body, status, publishAt, mediaFiles, preview, tagIds} = ctx.request.body || {};
            //const t = await db.sequelize.transaction();
            let blogOld = await Blog.findOne({
                where: {
                    id: id
                },
                include: [
                    {
                        model: Tag,
                        as: 'tags'
                    }
                ]
            })
            let updateInfo = {};
            if (!blogOld) {
                res.setError(`Blog ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if (slug && buildSlug(slug) !== blogOld.slug) {
                let checkDuplicateSlug = await Blog.findOne({
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
            let notFoundTag = []
            if (tagIds && tagIds.length > 0) {
                for (const tagId of tagIds) {
                    let tag = await Tag.findOne({
                        where: {
                            id: tagId
                        }
                    })
                    if (!tag) {
                        notFoundTag.push(tagId)
                    }
                }
                if (notFoundTag.length > 0) {
                    res.setError(`Tag ${notFoundTag.join(', ')} not found`, Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
            }
            if (type && type !== blogOld.type) {
                let blogType = await BlogType.findOne({
                    where: {
                        id: type
                    }
                })
                if (!blogType) {
                    res.setError(`Blog Type ${type} not found`, Constant.instance.HTTP_CODE.NotFound);
                    return res.send(ctx);
                }
                updateInfo.type = type
            }
            if (title && title !== blogOld.title) {
                updateInfo.title = title
            }
            if (body && !isEqual(body, blogOld.body)) {
                updateInfo.body = body
            }
            if (status && status !== blogOld.status) {
                updateInfo.status = status
            }
            if (publishAt && !isEqual(publishAt, blogOld.publishAt)) {
                updateInfo.publishAt = publishAt
            }
            if (preview && preview !== blogOld.preview) {
                updateInfo.preview = preview
            }
            if (mediaFiles && !isEqual(mediaFiles, blogOld.mediaFiles)) {
                updateInfo.mediaFiles = mediaFiles
            }
            await Blog.update(updateInfo, {
                where: {
                    id: id,
                },
            });
            if (tagIds && tagIds.length && !isEqual(tagIds.sort(), blogOld.tags.map(item => item.id).sort())) {
                await BlogToTag.destroy({
                    where: {
                        blogId: id,
                    }
                })
                await Promise.all(tagIds.map(async (tagId) => {
                    return BlogToTag.create({
                        blogId: id,
                        tagId: tagId
                    })
                }))
            }
            let blogNew = await Blog.findOne({
                where: {
                    id: id
                },
                include: [
                    {
                        model: Tag,
                        as: 'tags'
                    }
                ]
            })
            res.setSuccess(blogNew, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateBlog ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static putUpdateSEOBlog = async (ctx, next) => {
        try {
            const {id} = ctx.request.params
            const {seoInfo} = ctx.request.body
            let updateInfo = {}
            let blogOld = await Blog.findOne({
                where: {
                    id: id
                },
                attributes: ['id', 'seoInfo']
            })
            if (seoInfo && !isEqual(seoInfo, blogOld.seoInfo)) {
                updateInfo.seoInfo = seoInfo
            }
            await Blog.update(updateInfo, {
                where: {
                    id: id,
                },
            });
            let blogNew = await Blog.findOne({
                where: {
                    id: id
                },
                include: [
                    {
                        model: Tag,
                        as: 'tags'
                    }
                ]
            })
            res.setSuccess(blogNew, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateSeoBlog ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static deleteBlog = async (ctx, next) => {
        const t = await db.sequelize.transaction();
        try {
            const {id} = ctx.request.params
            await Blog.destroy({
                where: {
                    id: id,
                },
                transaction: t,
            })
            await BlogToTag.destroy({
                where: {
                    blogId: id,
                },
                transaction: t,
            })
            await t.commit();
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            await t.rollback();
            Logger.error('deleteBlog ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}