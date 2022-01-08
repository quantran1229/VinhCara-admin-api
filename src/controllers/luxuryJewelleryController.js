import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Op
} from 'sequelize';
import db, {
    LuxuryJewellery,
    Jewellery
} from '../models';

const res = new Response();

export default class LuxuryJewelleryController {
    static getLuxuryJewelleryInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const luxuryJewellery = await LuxuryJewellery.findOne({
                where: condition,
                include: [{
                    model: Jewellery,
                    as: 'jewelleryInfo',
                    required: false
                }]
            });
            if (!luxuryJewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(luxuryJewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLuxuryJewelleryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteLuxuryJewellery = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            const luxuryJewellery = await LuxuryJewellery.findOne({
                where: condition,
            });
            if (!luxuryJewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await luxuryJewellery.destroy();
            // Return info
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLuxuryJewelleryInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putLuxuryJewelleryUpdate = async (ctx, next) => {
        let transaction;
        try {
            const id = ctx.request.params.id;
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.slug = id.toLowerCase();
            }
            let luxuryJewellery = await LuxuryJewellery.findOne({
                where: condition,
            });
            if (!luxuryJewellery) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // update info
            let {
                slug,
                productCode,
                gender,
                status,
                mediafiles,
                blocks,
                SEOInfo,
                text,
                name
            } = ctx.request.body;
            let updateInfo = {};
            transaction = await db.sequelize.transaction();
            if (productCode && productCode != luxuryJewellery.productCode) {
                let x = await Promise.all([LuxuryJewellery.findOne({
                    where: {
                        productCode: luxuryJewellery.productCode,
                        id: {
                            [Op.not]: luxuryJewellery.id
                        }
                    }
                }), Jewellery.findOne({
                    where: {
                        productCode: productCode
                    }
                })]);
                if (!x[1]) {
                    res.setError(`Not found Jewellery`, Constant.instance.HTTP_CODE.NotFound, [{
                        field: 'productCode',
                        code: 'not found'
                    }]);
                    return res.send(ctx);
                }
                await Promise.all([Jewellery.update({
                    isLuxury: true
                }, {
                    where: {
                        productCode: productCode
                    },
                    transaction: transaction
                }), !x[0] ? Jewellery.update({
                    isLuxury: false
                }, {
                    where: {
                        productCode: luxuryJewellery.productCode
                    },
                    transaction: transaction
                }) : null]);
                updateInfo.productCode = productCode;
            }
            if (slug && slug != luxuryJewellery.slug) {
                let check = await LuxuryJewellery.findOne({
                    where: {
                        slug: slug
                    }
                });
                if (check) {
                    res.setError(`Conflicted`, Constant.instance.HTTP_CODE.Conflict, [{
                        field: 'productCode',
                        code: 'conflicted'
                    }]);
                    return res.send(ctx);
                }
                updateInfo.slug = slug;
            }
            if (gender && gender != luxuryJewellery.gender) {
                updateInfo.gender = gender;
            }
            if (status && status != luxuryJewellery.status) {
                updateInfo.status = status;
            }
            if (mediafiles && mediafiles != luxuryJewellery.mediafiles) {
                updateInfo.mediafiles = mediafiles;
            }
            if (blocks && blocks != luxuryJewellery.blocks) {
                updateInfo.blocks = blocks;
            }
            if (text && text != luxuryJewellery.text) {
                updateInfo.text = text;
            }
            if (name && name != luxuryJewellery.name) {
                updateInfo.name = name;
            }
            if (SEOInfo && SEOInfo != luxuryJewellery.SEOInfo) {
                updateInfo.SEOInfo = SEOInfo;
            }
            luxuryJewellery = await luxuryJewellery.update(updateInfo, {
                transaction: transaction
            });
            await transaction.commit();
            // Return info
            res.setSuccess(luxuryJewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            if (transaction) await transaction.rollback();
            Logger.error('putLuxuryJewelleryUpdate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postLuxuryJewelleryCreate = async (ctx, next) => {
        let transaction;
        try {

            // create
            let {
                slug,
                productCode,
                gender,
                status,
                mediafiles,
                blocks,
                SEOInfo,
                text,
                name
            } = ctx.request.body;
            transaction = await db.sequelize.transaction();
            let x = await Jewellery.findOne({
                where: {
                    productCode: productCode
                }
            })
            if (!x) {
                res.setError(`Not found Jewellery`, Constant.instance.HTTP_CODE.NotFound, [{
                    field: 'productCode',
                    code: 'not found'
                }]);
                return res.send(ctx);
            }
            let check = await LuxuryJewellery.findOne({
                where: {
                    slug: slug
                }
            });
            if (check) {
                res.setError(`Conflicted`, Constant.instance.HTTP_CODE.Conflict, [{
                    field: 'productCode',
                    code: 'conflicted'
                }]);
                return res.send(ctx);
            }
            let luxuryJewellery = await LuxuryJewellery.create({
                slug,
                productCode,
                gender,
                status: status || LuxuryJewellery.STATUS.ACTIVE,
                mediafiles: mediafiles || {},
                blocks: blocks || [],
                SEOInfo,
                text,
                name
            }, {
                transaction: transaction
            });
            await Jewellery.update({
                isLuxury: true
            }, {
                where: {
                    productCode: productCode
                },
                transaction: transaction
            });
            await transaction.commit();
            // Return info
            res.setSuccess(luxuryJewellery, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            if (transaction) await transaction.rollback();
            console.log(e);
            Logger.error('postLuxuryJewelleryCreate ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getLuxuryJewelleryList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.gender) {
                condition.gender = query.gender;
            }
            let list = await LuxuryJewellery.findAll({
                where: condition,
                attributes: {
                    exclude: ['blocks']
                }
            });
            // Return list
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getLuxuryJewelleryList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}