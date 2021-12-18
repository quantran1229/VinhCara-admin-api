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
    Tag, User
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    paging
} from '../utils/utils'
import {buildSlug} from '../utils/utils'
import dayjs from 'dayjs'

const res = new Response();

export default class BLogController {
    static async getListBlogs(ctx, next) {
        try {
            const {
                query
            } = ctx.request;
            const condition = {};
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
                tagCondition.tagId = query.tagId;
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
                attributes: ['id', 'type', 'title', 'slug', 'status', 'createdBy', 'createdAt', 'updatedAt', 'publishAt', 'seoInfo', 'mediaFiles', 'preview'],
                include: [
                    {
                        model: BlogType,
                        as: 'blogTypeInfo',
                        required: Object.keys(categoryCondition).length > 0 ? true : false,
                        attributes: ['id', 'name', 'slug'],
                        where: categoryCondition
                    },
                    {
                        model: BlogToTag,
                        as: 'listblogToTags',
                        required: Object.keys(tagCondition).length > 0 ? true : false,
                        attributes: ['tagId'],
                        where: tagCondition,
                    }
                ]
            }, pager));
            if (!result) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListBlogs ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getBlogInfo = async (ctx, next) => {
        try {
            let {
                id
            } = ctx.request.params;
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
                        model: BlogToTag,
                        as: 'listblogToTags',
                        attributes: ['tagId']
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
            let notFoundTag = []
            for (const tagId of tagIds) {
                let tag = await Tag.findOne({
                    where: {
                        id: tagId
                    }
                })
                if(!tag) {
                    notFoundTag.push(tagId)
                }
            }
            if (notFoundTag.length >0 ) {
                res.setError(`Tag ${notFoundTag.join(', ')} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let blog = await Blog.create({
                type,
                title,
                slug: buildSlug(slug),
                body,
                status,
                publishAt,
                seoInfo,
                mediaFiles,
                preview,
                createdBy: ctx.state.user.id,
            });
            if (blog) {
                let listBlogToTags =await Promise.all(tagIds.map(async (tagId) => {
                    return BlogToTag.create({
                        blogId: blog.id,
                        tagId: tagId
                    })
                }))
                console.log(listBlogToTags)
                blog.dataValues.listblogToTags = listBlogToTags
            }
            res.setSuccess(blog, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateNewBlog ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}