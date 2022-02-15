import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';

import {
    Op,
    Sequelize
} from 'sequelize'
import {
    Combo,
    Jewellery,
    JewellerySerial,
    WishlistLog
} from '../models';
import {
    paging
} from '../utils/utils'
import {
    isEqual
} from 'lodash'

const res = new Response();

export default class ComboController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getComboInfo = async (ctx, next) => {
        try {
            let include = [{
                model: JewellerySerial,
                as: 'serialList',
                attributes: ['serial', 'size', 'price', 'type']
            }];
            // get current user
            let user = null;
            if (ctx.state.user) {
                user = ctx.state.user;
                include.push({
                    model: WishlistLog,
                    required: false,
                    where: {
                        customerId: user.id,
                        isCurrent: true,
                        status: WishlistLog.STATUS.LIKE,
                    },
                    as: 'wishlistInfo',
                    attributes: [
                        ['status', 'isLiked']
                    ]
                })
            }
            const id = ctx.request.params.id;
            let combo = await Combo.getInfo(id, true);

            if (!combo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let jewelleryList = await Jewellery.findAll({
                where: {
                    productCode: {
                        [Op.in]: combo.productCode
                    }
                },
                attributes: [
                    ['productCode', 'id'], 'type', 'productCode', 'productName', 'mainCategory', 'size', 'price', 'mediafiles'
                ],
                include: include,
                order: [
                    [{
                        model: JewellerySerial,
                        as: 'serialList',
                    }, 'type', 'ASC']
                ]
            });
            for (let jew of jewelleryList) {
                let serialList = jew.serialList.reduce((list, e) => {
                    if (list.find(x => x.size == e.size)) {
                        return list;
                    }
                    if (e.size == jew.size) e.dataValues.isDefault = true;
                    list.push(e);
                    return list;
                }, [])
                jew.serialList = serialList;
            }
            combo.dataValues.jewelleryList = jewelleryList;
            res.setSuccess(combo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getComboInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getComboList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            let order = [
                ['createdAt', 'DESC']
            ];

            const pager = paging(query);
            let result = await Combo.getList(condition, pager, order);
            // Return list
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getComboList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postCreateCombo = async (ctx, next) => {
        try {
            const {
                link,
                mediafiles,
                meta,
                name,
                productCode,
                SEOInfo,
                status,
                bannerInfo,
                desc
            } = ctx.request.body;
            let combo = await Combo.create({
                link,
                mediafiles,
                meta,
                name,
                productCode,
                SEOInfo,
                status,
                bannerInfo,
                desc,
                createdBy: ctx.state.user.id,
            })
            res.setSuccess(combo, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateCombo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdateCombo = async (ctx, next) => {
        try {
            const {
                id
            } = ctx.request.params
            const {
                link,
                mediafiles,
                meta,
                name,
                productCode,
                status,
                bannerInfo,
                desc
            } = ctx.request.body;
            let updateInfo = {};
            let respCombo = await Combo.findOne({
                where: {
                    id: id
                }
            })
            if (!respCombo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if (link && link != respCombo.link) {
                updateInfo.link = link
            }
            if (name && name != respCombo.name) {
                updateInfo.name = name
            }
            if (desc && desc != respCombo.desc) {
                updateInfo.desc = desc
            }
            if (status && status != respCombo.status) {
                updateInfo.status = status
            }
            if (mediafiles && !isEqual(mediafiles, respCombo.mediafiles)) {
                updateInfo.mediafiles = mediafiles
            }
            if (meta && !isEqual(meta, respCombo.meta)) {
                updateInfo.meta = meta
            }
            if (productCode && !isEqual(productCode, respCombo.productCode)) {
                updateInfo.productCode = productCode
            }
            if (bannerInfo && !isEqual(bannerInfo, respCombo.bannerInfo)) {
                updateInfo.bannerInfo = bannerInfo
            }
            respCombo = await respCombo.update(updateInfo);
            // Return info
            res.setSuccess(respCombo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateCombo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdateSeoInfoCombo = async (ctx, next) => {
        try {
            const { id } = ctx.request.params
            const {
                SEOInfo
            } = ctx.request.body;
            let updateInfo = {};
            let respCombo = await Combo.findOne({
                where: {
                    id: id
                }
            })
            if (!respCombo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            if (SEOInfo && !isEqual(SEOInfo, respCombo.SEOInfo)) {
                updateInfo.SEOInfo = SEOInfo
            }
            respCombo = await respCombo.update(updateInfo);
            // Return info
            res.setSuccess(respCombo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateSeoInfoCombo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteCombo = async (ctx, next) => {
        try {
            const {
                id
            } = ctx.request.params
            let respCombo = await Combo.findOne({
                where: {
                    id: id
                }
            })
            if (!respCombo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await Combo.destroy({
                where: {
                    id: id
                }
            })
            res.setSuccess({
                deleted: true
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteCombo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteJewelleryInCombo = async (ctx, next) => {
        try {
            const {
                id,
                jewelleryId
            } = ctx.request.params
            let respCombo = await Combo.findOne({
                where: {
                    id: id
                }
            })
            if (!respCombo) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let updateInfo = {}
            let index = respCombo.productCode.findIndex(item => item === jewelleryId)
            if (index !== -1) {
                respCombo.productCode.splice(index, 1)
                updateInfo.productCode = respCombo.productCode
            }
            respCombo = await respCombo.update(updateInfo);
            // Return info
            res.setSuccess(respCombo, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteJewelleryInCombo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}