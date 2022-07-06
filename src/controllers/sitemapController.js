import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Sitemap
} from '../models';
import {
    remove as removeAccent
} from 'diacritics';
import {
    paging,
    buildSlug
} from '../utils/utils';
import extractUrls from 'extract-urls';
import urlStatusCode from 'url-status-code';
import {
    Op,
    Sequelize,
} from 'sequelize';
import {
    generateSitemapIndex
} from '../scripts/sitemapGenerator';

const res = new Response();

export default class SitemapController {
    static getList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.name) {
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('name')), {
                    [Op.iLike]: `%${removeAccent(query.name)}%`
                });
            }

            const pager = paging(query);

            const {
                count,
                rows
            } = await Sitemap.findAndCountAll(Object.assign({
                where: condition,
            }, pager));

            // Return list
            res.setSuccess({
                count: count,
                list: rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Sitemap list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            // Query
            const sitemap = await Sitemap.findOne({
                where: {
                    id: id
                }
            });

            if (!sitemap) res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);

            // Return list
            res.setSuccess(sitemap, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Sitemap list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postCreate = async (ctx, next) => {
        try {
            const {
                sitemap,
                name,
            } = ctx.request.body;
            // Query
            let currentUrls = extractUrls(sitemap);
            let link = process.env.WEB_PUBLIC_URL + '/sitemap/' + buildSlug(removeAccent(name.toLowerCase())) + '.xml';
            const checkDuplicate = await Sitemap.findOne({
                where: {
                    [Op.or]: [{
                        name: name
                    }, {
                        link: link
                    }]
                }
            });
            if (checkDuplicate) {
                res.setError(`Duplicated name`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'name',
                });
                return res.send(ctx);
            }
            const newSitemap = await Sitemap.create({
                sitemap,
                name,
                link,
                urls: currentUrls
            });

            // update mainSitemap
            const list = await Sitemap.findAll({
                orrder: [
                    ['isAutoGen', 'ASC'],
                    ['id', 'ASC']
                ],
                where: {
                    id: {
                        [Op.not]: 1
                    }
                }
            });
            await generateSitemapIndex(list.map(e => e.link))
            // // Return list
            res.setSuccess(newSitemap, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Sitemap list ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdate = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            // Query
            let sitemapObj = await Sitemap.findOne({
                where: {
                    id: id
                }
            });

            if (!sitemapObj) res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
            const {
                sitemap
            } = ctx.request.body;
            let currentUrls = extractUrls(sitemap);
            sitemapObj = await sitemapObj.update({
                sitemap,
                urls: currentUrls
            });

            // Return list
            res.setSuccess(sitemapObj, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Sitemap update' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteRemove = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            // Query
            let sitemapObj = await Sitemap.findOne({
                where: {
                    id: id
                }
            });

            if (!sitemapObj) res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
            await sitemapObj.destroy()
            // Return list
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('Sitemap delete' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}