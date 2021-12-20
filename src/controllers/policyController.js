import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import removeDiacritics from 'diacritics';
import {
    buildSlug
} from '../utils/utils';
import {
    Op,
    Sequelize
} from 'sequelize';
import db, {
    Policy
} from '../models';

const res = new Response();

export default class PolicyController {
    // Check health, return memory usage + uptime + mediafiles disk size
    static getPolicyInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const policy = await Policy.findOne({
                where: condition
            });
            if (!policy) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(policy, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPolicyInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getPolicyList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.slug) {
                condition.slug = {
                    [Op.in]: slug.split(',')
                }
            }
            if (query.id) {
                condition.id = {
                    [Op.in]: id.split(',')
                }
            }
            const policies = await Policy.findAll({
                where: condition,
                attributes: ["id", "preview", "name", "mediafiles", "slug"],
                order: [
                    ['id', 'ASC']
                ]
            })

            // Return list
            res.setSuccess(policies, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getPolicyList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postPolicyCreate = async (ctx, next) => {
        try {
            let {
                name,
                preview,
                body,
                mediafiles,
                slug
            } = ctx.request.body;
            // Query
            slug = buildSlug(slug || removeDiacritics(name.toLowerCase()));
            let checkSlug = await Policy.findOne({
                where: {
                    slug: slug
                }
            });
            if (checkSlug) {
                res.setError(`Duplicate`, Constant.instance.HTTP_CODE.Conflict, [{
                    field: 'slug',
                    code: 'duplicated'
                }]);
                return res.send(ctx);
            }
            const policy = await Policy.create({
                name,
                preview,
                body,
                mediafiles,
                slug
            });

            // Return list
            res.setSuccess(policy, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postPolicy ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static updatePolicyInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            let policy = await Policy.findOne({
                where: condition
            });
            if (!policy) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let {
                name,
                preview,
                body,
                mediafiles,
                slug
            } = ctx.request.body;
            slug = buildSlug(slug);
            let updateInfo = {};
            if (name && name != policy.name) {
                updateInfo.name = name;
            }
            if (preview && preview != policy.preview) {
                updateInfo.preview = preview;
            }
            if (body && body != policy.body) {
                updateInfo.body = body;
            }
            if (mediafiles && mediafiles != policy.mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            if (slug && slug != policy.slug) {
                let checkSlug = await Policy.findOne({
                    where: {
                        slug: slug,
                        id: {
                            [Op.not]: id
                        }
                    }
                });
                if (checkSlug) {
                    res.setError(`Duplicate`, Constant.instance.HTTP_CODE.Conflict, [{
                        field: 'slug',
                        code: 'duplicated'
                    }]);
                    return res.send(ctx);
                }
                updateInfo.slug = slug;
            }
            policy = await policy.update(updateInfo);
            // Return info
            res.setSuccess(policy, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('updatePolicyInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deletePolicy = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const policy = await Policy.findOne({
                where: condition
            });
            if (!policy) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await policy.destroy();
            // Return info
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deletePolicy ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}