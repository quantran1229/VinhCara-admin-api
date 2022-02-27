import db, {Tag, BlogToTag} from '../models';
import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    buildSlug
} from '../utils/utils'
import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize'

const res = new Response();

export default class TagController {
    static async getListTags(ctx, next) {
        try {
            const query = ctx.request.query;
            const condition = {};
            if (query.keyword) {
                query.keyword = removeAccent(query.keyword);
                condition.title = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('title')), {
                    [Op.iLike]: `%${query.keyword}%`
                });
            }
            const result = await Tag.findAll({where: condition})
            if (!result) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListTags ' + e.message + ' ' + e.stack);
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async postCreateTag(ctx, next) {
        try {
            const {
                title,
                link,
                desc,
            } = ctx.request.body;
            let checkDuplicateLink = await Tag.findOne({
                where: {
                    link: buildSlug(link)
                }
            })
            if (checkDuplicateLink) {
                res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'link',
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                return res.send(ctx);
            }
            let tag = await Tag.create({
                title,
                desc,
                link: buildSlug(link)
            })
            res.setSuccess(tag, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateTag ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async putUpdateTag(ctx, next) {
        try {
            const { id } = ctx.request.params
            const {
                title,
                link,
                desc,
            } = ctx.request.body;
            let updateInfo = {};
            let tagOld = await Tag.findOne({
                where: {
                    id: id
                }
            })
            if (!tagOld) {
                res.setError(`Tag ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if(title && title !== tagOld.title) {
                updateInfo.title = title
            }
            if(desc && desc !== tagOld.desc) {
                updateInfo.desc = desc
            }
            if(link && buildSlug(link) !== tagOld.link) {
                let checkDuplicateLink = await Tag.findOne({
                    where: {
                        link: buildSlug(link)
                    }
                })
                if (checkDuplicateLink) {
                    res.setError(`Duplicated link`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'link',
                    }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                    return res.send(ctx);
                }
                updateInfo.link = buildSlug(link)
            }
           await Tag.update(updateInfo, {
                where: {
                    id: id
                }
            })
            let tagNew = await Tag.findOne({
                where: {
                    id: id
                }
            })
            res.setSuccess(tagNew, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateTag ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
    static async deleteTag(ctx, next) {
        const t = await db.sequelize.transaction();
        try {
            const { id } = ctx.request.params;
            let tag = await Tag.findOne({
                where: {
                    id: id
                }
            })
            if (!tag) {
                res.setError(`Tag ${id} not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await Tag.destroy({
                where: {
                    id: id
                },
                transaction: t,
            })
            await BlogToTag.destroy({
                where: {
                    tagId: id
                },
                transaction: t,
            })
            await t.commit();
            res.setSuccess({deleted: true}, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            await t.rollback();
            Logger.error('deleteTag ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}