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
    Tag
} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    paging
} from '../utils/utils'

const res = new Response();

export default class BLogController {
    static async getListBlogs(ctx, next) {
        try {
            const {
                query
            } = ctx.request;
            const condition = {};
            if (query.type) {
                condition.type = query.type;
            }
            if (query.status) {
                condition.status = query.status;
            }
            let categoryCondition = {}
            if (query.category) {
                categoryCondition.slug = query.category;
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
                include: [{
                    model: BlogType,
                    as: 'blogTypeInfo',
                    required: Object.keys(categoryCondition).length > 0 ? true : false,
                    attributes: ['id', 'name', 'slug'],
                    where: categoryCondition
                }, ]
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
            //     let listBlogsConnection = await Blog.findAll({
            //         attributes: ['id', 'type'],
            //         include:[{
            //             model: BlogToTag,
            //             as: 'listblogToTags',
            //             required:false,
            //             attributes: ['blogId', 'tagId']
            //         }],
            //         where: {
            //             id: {
            //                 [Op.ne]: respBlogInfo.id
            //             },
            //             [Op.and]: [{
            //                 [Op.or]: [{
            //                     type: respBlogInfo.type
            //                 }, Sequelize.literal(`"blogToTags"."tagId" = ANY('{1,2}')`)]
            //             }]
            //         },
            //         limit: 5
            // })
            if (!respBlogInfo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let sqlListBlogs = `SELECT "blogs"."id", "blogs"."type", "blogs"."title", "blogs"."slug", "blogs"."status", "blogs"."createdBy",
                                       "blogs"."createdAt", "blogs"."updatedAt", "blogs"."publishAt", "blogs"."seoInfo", "blogs"."mediaFiles", "blogs"."preview",
                                       COUNT("blogToTags"."tagId") as countTag
                                FROM blogs LEFT OUTER JOIN "blogToTags" ON "blogToTags"."blogId" = "blogs"."id"
                                WHERE id <> ${respBlogInfo.id}
                                  AND ("blogToTags"."tagId" = ANY('{${respBlogInfo.listblogToTags.map(item => item.tagId).join(',')}}') OR "blogs"."type" = ${respBlogInfo.type})
                                GROUP BY "blogs"."id"
                                ORDER BY countTag DESC, "blogs"."publishAt" ASC
                                LIMIT 5`;
            let listBlogsConnection = await db.sequelize.query(sqlListBlogs, {
                type: QueryTypes.SELECT
            })
            res.setSuccess({
                blogInfo: respBlogInfo,
                listBlogsConnection: listBlogsConnection || []
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getBlogInfo ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}