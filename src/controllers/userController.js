import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import bcrypt from 'bcrypt';
import {
    sign
} from 'jsonwebtoken';
import {
    Op,
    Sequelize,
} from 'sequelize'
import db, {
    User,
    UserType
} from '../models';
import {
    paging,
    getPrivateKey,
    getRandomString
} from '../utils/utils';
import CryptoJS, {
    AES
} from 'crypto-js';
import Queue from 'bee-queue';

const SECRET = 'I7NLQ1n5ib4opfwVXzyk0JrgQeiFGadS';

// // Mail Queue
// const mailQueue = new Queue(Constant.instance.QUEUE_CONFIG.MAIL_QUEUE, {
//     redis: {
//         host: Constant.instance.REDIS_CONFIG.host,
//         port: Constant.instance.REDIS_CONFIG.port
//     },
//     prefix: 'vcr',
//     sendEvents: true,
//     getEvents: false,
//     isWorker: false,
// });

// mailQueue.on("ready", () => {
//     Logger.info(`Mail Queue is ready to work`);
// });

// mailQueue.on("error", (err) => {
//     Logger.error(`A queue error happened: ${err.message}`);
// });

const res = new Response();
export default class UserController {
    static postCreateNewUser = async (ctx, next) => {
        try {
            const {
                name,
                email,
                phone,
                password,
                permission,
                userType
            } = ctx.request.body;
            let checkDuplicate = await Promise.all([
                User.findOne({
                    where: {
                        email: email
                    }
                }),
                User.findOne({
                    where: {
                        phone: phone
                    }
                })
            ]);
            // Validate info from database
            if (checkDuplicate[0] || checkDuplicate[1]) {
                if (checkDuplicate[0]) {
                    res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, {
                        field: 'email'
                    }, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                    return res.send(ctx);
                }
                res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, {
                    field: 'phone'
                }, Constant.instance.ERROR_CODE.User_DUPLICATE_PHONE);
                return res.send(ctx);
            }
            let type = await UserType.scope('active').findOne({
                where: {
                    id: userType
                }
            });
            if (!type) {
                res.setError(`User type not found`, Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }

            const saltRounds = Constant.instance.DEFAULT_SALT_ROUND;
            let hashPassword = bcrypt.hashSync(password, saltRounds);

            // Save to database
            let user = await User.create({
                name: name,
                email: email,
                phone: phone,
                userType: type.id,
                permission: permission ? permission : type.permission,
                password: hashPassword,
                status: User.STATUS.ACTIVE,
                meta: {}
            });

            // Remove password
            user.dataValues.password = null;
            res.setSuccess(user, Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('postCreateNewUser ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static login = async (ctx, next) => {
        try {
            const {
                username,
                password
            } = ctx.request.body;
            let user = await User.getInfo(username);
            if (!user) {
                res.setError('User not found or bad password', Constant.instance.HTTP_CODE.BadRequest, null, Constant.instance.ERROR_CODE.User_NOT_FOUND_OR_BAD_PASSWORD);
                return res.send(ctx);
            }
            if (user.status == User.STATUS.INACTIVE) {
                res.setError('User is inactive', Constant.instance.HTTP_CODE.BadRequest, null, Constant.instance.ERROR_CODE.User_ACTIVE_NEEDED);
                return res.send(ctx);
            }
            // Check password
            let check = bcrypt.compareSync(password, user.password);
            if (!check) {
                res.setError('User not found or bad password', Constant.instance.HTTP_CODE.BadRequest, null, Constant.instance.ERROR_CODE.User_NOT_FOUND_OR_BAD_PASSWORD);
                return res.send(ctx);
            }

            // Generate JWT:
            let privateKey = getPrivateKey();

            const token = sign({
                id: user.id
            }, privateKey, {
                algorithm: "RS256",
                expiresIn: "7d",
                audience: ["admin.vinhcara"],
            });
            const userInfo = {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                permission: user.permission
            }
            res.setSuccess({
                userInfo: userInfo,
                token: token
            });
            return res.send(ctx);
        } catch (e) {
            Logger.error('Login ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getInfo = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            let user = await User.scope('active').findOne({
                where: {
                    id: id
                },
                attributes: {
                    exclude: ['meta', 'password', 'status']
                },
                include: [{
                    model: UserType,
                    as: 'typeInfo',
                    attributes: ['id', 'name']
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            res.setSuccess(user, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static logout = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('logout ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdateInfo = async (ctx, next) => {
        try {
            const {
                name,
                email,
                phone,
                avatar
            } = ctx.request.body;
            // Get current user id from token
            let id = ctx.state.user.id;
            let user = await User.scope('active').findOne({
                where: {
                    id: id
                },
                attributes: {
                    exclude: ['password']
                }
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            let updateInfo = {};
            if ((email && email != user.email) || (phone && phone != user.phone)) {
                let checkDuplicate = await Promise.all([
                    (email && email != user.email) ?
                    User.findOne({
                        where: {
                            email: email,
                            id: {
                                [Op.not]: id
                            }
                        }
                    }) : null,
                    (phone && phone != user.phone) ?
                    User.findOne({
                        where: {
                            phone: phone,
                            id: {
                                [Op.not]: id
                            }
                        }
                    }) : null
                ]);
                // Validate info from database
                if (checkDuplicate[0] || checkDuplicate[1]) {
                    if (checkDuplicate[0]) {
                        res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, null, Constant.instance.ERROR_CODE.User_DUPLICATE_EMAIL);
                        return res.send(ctx);
                    }
                    res.setError(`Duplicated`, Constant.instance.HTTP_CODE.Conflict, null, Constant.instance.ERROR_CODE.User_DUPLICATE_PHONE);
                    return res.send(ctx);
                }
                if (email && email != user.email) {
                    updateInfo.email = email;
                }
                if (phone && phone != user.phone) {
                    updateInfo.phone = phone;
                }
            }
            // Save to database
            if (name && name != user.name) {
                updateInfo.name = name;
            }

            if (avatar && avatar != user.avatar) {
                updateInfo.avatar = avatar;
            }
            // update
            user = await user.update(updateInfo);
            // Remove password
            user.dataValues.password = null;
            res.setSuccess(user, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateInfo ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdatePassword = async (ctx, next) => {
        try {
            const {
                oldPassword,
                newPassword,
            } = ctx.request.body;
            let id = ctx.state.user.id;
            let user = await User.scope('active').findOne({
                where: {
                    id: id
                },
                attributes: ['id', 'password']
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            let check = bcrypt.compareSync(oldPassword, user.password);
            if (!check) {
                res.setError("Worng password", Constant.instance.HTTP_CODE.Unauthorized, null, Constant.instance.ERROR_CODE.BAD_PASSWORD);
                return res.send(ctx);
            }
            const saltRounds = Constant.instance.DEFAULT_SALT_ROUND;
            let password = bcrypt.hashSync(newPassword, saltRounds);
            await user.update({
                password: password
            });
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdatePassword ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static forgetPassword = async (ctx, next) => {
        // send mail
        try {

        } catch (e) {
            Logger.error('forgetPassword ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}