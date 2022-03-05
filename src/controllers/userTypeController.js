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
    UserType,
    User
} from '../models';
import {
    paging
} from '../utils/utils';

const res = new Response();

export default class UserTypeController {
    // Check health, return memory usage + uptime + mediafile disk size
    static getUserTypeInfo = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const userType = await UserType.findOne({
                where: {
                    id: id
                },
                include: [{
                    model: User,
                    as: "createdByInfo",
                    attributes: ["id", "name"]
                }]
            });
            if (!userType) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess(userType, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getUserTypeInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getUserTypeList = async (ctx, next) => {
        try {
            const query = ctx.request.query;
            // Query
            const condition = {};
            if (query.status) {
                condition.status = query.status;
            }
            if (query.name) {
                query.name = removeAccent(query.name)
                condition.name = Sequelize.where(Sequelize.fn('UNACCENT', Sequelize.col('name')), {
                    [Op.iLike]: `%${query.name}%`
                });
            }
            let order = [
                ['id', 'ASC']
            ];
            if (query.orderBy) {
                switch (query.orderBy) {
                    case 'nameDesc':
                        order = [
                            ['name', 'DESC']
                        ];
                        break;
                    case 'nameAsc':
                        order = [
                            ['name', 'ASC']
                        ];
                        break;
                    case 'idDesc':
                        order = [
                            ['id', 'DESC']
                        ];
                        break;
                    case 'idAsc':
                        order = [
                            ['id', 'ASC']
                        ];
                        break;
                }
            }
            let pager = paging(query);
            const result = await UserType.findAndCountAll(Object.assign({
                where: condition,
                attributes: ["id", "name", "createdBy", "createdAt"],
                order: order,
                include: [{
                    model: User,
                    as: "createdByInfo",
                    attributes: ["id", "name"]
                }]
            }, pager))

            // Return list
            res.setSuccess({
                count: result.count,
                list: result.rows
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getUserTypeList ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static createUserType = async (ctx, next) => {
        try {
            const {
                name,
                desc,
                permission
            } = ctx.request.body;
            let userType = await UserType.create({
                name,
                desc,
                permission: permission || [],
                createdBy: ctx.state.user.id,
                meta: {},
                status: UserType.STATUS.ACTIVE
            });
            // Return info
            res.setSuccess(userType, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getUserTypeInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static updateUserType = async (ctx, next) => {
        try {
            const {
                name,
                desc,
                permission,
                status
            } = ctx.request.body;
            const id = ctx.request.params.id;
            let userType = await UserType.findOne({
                where: {
                    id: id
                }
            });
            if (!userType) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let updateInfo = {};
            if (name && userType.name != name) {
                updateInfo.name = name;
            }
            if (status && userType.status != status) {
                updateInfo.status = status;
            }
            if (desc && userType.desc != desc) {
                updateInfo.desc = desc;
            }
            if (permission && userType.permission != permission) {
                updateInfo.permission = permission;
            }
            userType = await userType.update(updateInfo);
            // Return info
            res.setSuccess(userType, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getUserTypeInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteUserType = async (ctx, next) => {
        try {
            const id = ctx.request.params.id;
            const userType = await UserType.findOne({
                where: {
                    id: id
                }
            });
            if (!userType) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            await userType.destroy();
            // Return info
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getUserTypeInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}