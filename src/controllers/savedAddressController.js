import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    Op,
    Sequelize
} from 'sequelize';
import {
    v4 as uuid
} from 'uuid';
import db, {
    SavedAddress,
    Customer,
    Location
} from '../models';

const res = new Response();

export default class SavedAddressController {
    static getListSavedAddresses = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    required: false,
                    as: 'addresses',
                    include: [{
                            model: Location,
                            as: 'providenceInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'cityInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'districtInfo',
                            attributes: ['id', 'name', 'type']
                        }
                    ],
                }],
                order: [
                    [{
                        model: SavedAddress,
                        as: 'addresses',
                    }, "isDefault", "ASC"],
                    [{
                            model: SavedAddress,
                            as: 'addresses',
                        },
                        "createdAt", "DESC"
                    ]
                ]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            // Return info
            res.setSuccess({
                count: user.addresses.length,
                data: user.addresses
            }, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getListSavedAddresses ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getDefaultAddressInfo = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    as: 'defaultAddress',
                    required: false,
                    include: [{
                            model: Location,
                            as: 'providenceInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'cityInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'districtInfo',
                            attributes: ['id', 'name', 'type']
                        }
                    ],
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            if (!user.defaultAddress) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(user.defaultAddress, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDefaultAddressInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getAddressInfo = async (ctx, next) => {
        try {
            let addressId = ctx.request.params.id;
            let id = ctx.state.user.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    as: 'addresses',
                    required: false,
                    where: {
                        id: addressId
                    },
                    include: [{
                            model: Location,
                            as: 'providenceInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'cityInfo',
                            attributes: ['id', 'name', 'type']
                        },
                        {
                            model: Location,
                            as: 'districtInfo',
                            attributes: ['id', 'name', 'type']
                        }
                    ],
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            if (user.addresses.length == 0) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            res.setSuccess(user.addresses[0], Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getDefaultAddressInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static postCreateNewAddress = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    as: 'defaultAddress',
                    required: false,
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            };
            let {
                address,
                recieverName,
                phone,
                cityId,
                districtId,
                providenceId,
                type,
                isDefault
            } = ctx.request.body;
            if (!recieverName) recieverName = user.name;
            if (!phone) phone = user.phone;
            if (!user.defaultAddress) isDefault = true;
            if (!isDefault) isDefault = false;
            if (!type) type = SavedAddress.TYPE.HOME;
            let result = await Promise.all([isDefault && user.defaultAddress ? user.defaultAddress.update({
                    isDefault: false
                }) : null,
                SavedAddress.create({
                    id: uuid(),
                    userId: user.id,
                    address,
                    cityId,
                    districtId,
                    providenceId,
                    cityId,
                    recieverName,
                    phone,
                    type,
                    isDefault
                })
            ])
            res.setSuccess(result[1], Constant.instance.HTTP_CODE.Created);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getSavedAddressInfo ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static putUpdateSavedAddress = async (ctx, next) => {
        try {
            let id = ctx.state.user.id;
            let addressId = ctx.request.params.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    as: 'addresses',
                    required: false,
                    where: {
                        id: addressId
                    },
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            if (user.addresses.length == 0) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let savedAddress = user.addresses[0];
            let updateInfo = {}
            let {
                address,
                recieverName,
                phone,
                cityId,
                districtId,
                providenceId,
                type,
                isDefault
            } = ctx.request.body;
            if (address && savedAddress.address != address) {
                updateInfo.address = address;
            }
            if (recieverName && savedAddress.recieverName != recieverName) {
                updateInfo.recieverName = recieverName;
            }
            if (phone && savedAddress.phone != phone) {
                updateInfo.phone = phone;
            }
            if (cityId && savedAddress.cityId != cityId) {
                updateInfo.cityId = cityId;
            }
            if (districtId && savedAddress.districtId != districtId) {
                updateInfo.districtId = districtId;
            }
            if (providenceId && savedAddress.providenceId != providenceId) {
                updateInfo.providenceId = providenceId;
            }
            if (type && savedAddress.type != type) {
                updateInfo.type = type;
            }
            if (isDefault && savedAddress.isDefault != isDefault) {
                updateInfo.isDefault = isDefault;
            }
            await Promise.all([updateInfo.isDefault ? SavedAddress.update({
                isDefault: false
            }, {
                where: {
                    isDefault: true
                }
            }) : null, savedAddress.update(updateInfo)]);
            let result = await SavedAddress.findOne({
                where: {
                    id: addressId
                },
                include: [{
                        model: Location,
                        as: 'providenceInfo',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        model: Location,
                        as: 'cityInfo',
                        attributes: ['id', 'name', 'type']
                    },
                    {
                        model: Location,
                        as: 'districtInfo',
                        attributes: ['id', 'name', 'type']
                    }
                ],
            })
            res.setSuccess(result, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('putUpdateSavedAddress ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static deleteSavedAddress = async (ctx, next) => {
        try {
            let addressId = ctx.request.params.id;
            let id = ctx.state.user.id;
            let user = await Customer.scope('active').findOne({
                where: {
                    id: id
                },
                include: [{
                    model: SavedAddress,
                    as: 'addresses',
                    required: false,
                    where: {
                        id: addressId
                    },
                }]
            });
            if (!user) {
                res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
                return res.send(ctx);
            }
            if (user.addresses.length == 0) {
                res.setError("Not found", Constant.instance.HTTP_CODE.NotFound);
                return res.send(ctx);
            }
            let anotherOne = null;
            // Update an other saved address as default
            if (user.addresses[0].isDefault) {
                anotherOne = await SavedAddress.findOne({
                    where: {
                        userId: user.id,
                        isDefault: false
                    },
                    order: [['updatedAt', 'DESC']]
                })
            }
            await Promise.all([user.addresses[0].isDefault && anotherOne ? anotherOne.update({
                isDefault: true
            }) : null, user.addresses[0].destroy()]);
            res.setSuccess(null, Constant.instance.HTTP_CODE.SuccessNoContent);
            return res.send(ctx);
        } catch (e) {
            Logger.error('deleteSavedAddress ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}