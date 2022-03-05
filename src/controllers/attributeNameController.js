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
    AttributeName,
    Jewellery,
    DiamondSerial
} from '../models';
import {
    paging
} from '../utils/utils';

const res = new Response();

export default class LocationController {
    // Check health, return memory usage + uptime + mediafile disk size

    static getAttributeNameList = async (ctx, next) => {
        try {
            let query = ctx.request.query;
            let pager = paging(query);
            // Query
            const condition = {};
            if (query.type) {
                condition.type = query.type;
            }
            if (query.showName) {
                query.showName = removeAccent(query.showName);
                condition.showName = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('showName')), {
                    [Op.iLike]: `%${query.showName}%`
                });
            }
            let order = [
                ['showName', 'ASC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'nameDesc':
                        order = [
                            ['showName', 'DESC']
                        ];
                        break;
                    case 'nameAsc':
                        order = [
                            ['showName', 'ASC']
                        ];
                        break;
                }
            }
            const attributes = await AttributeName.findAndCountAll(Object.assign({
                where: condition,
                order: order,
                attributes: ["showName", "name", "desc", "type", "attributeCode"]
            }, pager));

            // Return list
            res.setSuccess({
                count: attributes.count,
                list: attributes.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getAttributeNameList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getAttributeInfo = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            // Query
            let attribute = await AttributeName.findOne({
                where: {
                    attributeCode: id
                }
            })

            if (!attribute) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }

            let valueList = []
            if (attribute.type == AttributeName.TYPE.JEWELLERY) {
                if (Object.keys(Jewellery.rawAttributes).includes(attribute.name)) {
                    let result = await Jewellery.findAll({
                        raw: true,
                        attributes: [
                            [Sequelize.fn("DISTINCT", Sequelize.col(attribute.name)), "value"]
                        ]
                    });
                    valueList = result.map(e => e.value);
                } else {
                    let result = await Jewellery.findAll({
                        raw: true,
                        attributes: [
                            [Sequelize.fn("DISTINCT", Sequelize.literal(`"extraProperties"->'${attribute.name}'`)), "value"]
                        ]
                    });
                    valueList = result.map(e => e.value);
                }
            } else {
                if (Object.keys(DiamondSerial.rawAttributes).includes(attribute.name)) {
                    let result = await DiamondSerial.findAll({
                        raw: true,
                        attributes: [
                            [Sequelize.fn("DISTINCT", Sequelize.col(attribute.name)), "value"]
                        ]
                    });
                    valueList = result.map(e => e.value);
                } else {
                    let result = await DiamondSerial.findAll({
                        raw: true,
                        attributes: [
                            [Sequelize.fn("DISTINCT", Sequelize.literal(`"extraProperties"->'${attribute.name}'`)), "value"]
                        ]
                    });
                    valueList = result.map(e => e.value);
                }
            }
            attribute.dataValues.valueList = valueList.sort((a, b) => {
                if (!isNaN(a) && !isNaN(b)) {
                    return parseFloat(a) - parseFloat(b);
                } else return a - b;
            });
            // Return list
            res.setSuccess(attribute, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getAttributeNameList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putAttributeUpdate = async (ctx, next) => {
        try {
            let id = ctx.request.params.id;
            // Query
            let attribute = await AttributeName.findOne({
                where: {
                    attributeCode: id
                }
            })

            if (!attribute) {
                res.setError(`Not found`, Constant.instance.HTTP_CODE.NotFound, null);
                return res.send(ctx);
            }

            let {
                // name,
                showName,
                desc
            } = ctx.request.body;
            let updateInfo = {};
            if (showName && showName != attribute.showName) {
                updateInfo.showName = attribute.showName;
            }
            if (desc && desc != attribute.desc) {
                updateInfo.desc = attribute.desc;
            }
            attribute = await attribute.update(updateInfo);
            res.setSuccess(attribute, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getAttributeNameList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}