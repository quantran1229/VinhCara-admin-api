'use strict';
const {
    Model,
    Op,
    literal,
    Sequelize
} = require('sequelize');
import dayjs from 'dayjs';
module.exports = (sequelize, DataTypes) => {
    class Coupon extends Model {
        static COUPON_TYPE = {
            DISCOUNT: 1,
            DISCOUNT_GIFT: 2,
            GIFT: 3
        }
        static TYPE = {
            PUBLIC: 1,
            PRIVATE: 2
        }
        static STATUS = {
            ACTIVE: 1,
            INACTIVE: -1,
            FINISHED: 2,
            STOP: -2
        }

        static USER_TYPE = {
            ALL: 1,
            CUSTOMER: 2
        }

        static async getList(condition, pager) {
            let result = await this.findAndCountAll(Object.assign({
                where: condition,
                order: [
                    ['endTime', 'DESC NULLS LAST'],
                    ['startTime', 'ASC']
                ],
                attributes: ['id', 'code', 'gifts', 'discountPrice', 'discountPercent', 'couponType', 'minimumRequirement', 'desc', 'showValue', 'createdAt', 'startTime', 'endTime']
            }, pager));
            return {
                count: result.count,
                list: result.rows
            };
        }

        static getInfo(id) {
            let condition = {};
            if (!isNaN(id)) {
                condition.id = id;
            } else {
                condition.code = id.toUpperCase();
            }
            return this.findOne({
                where: condition
            })
        }

        static associate(models) {
            // define association here
            Coupon.hasMany(models.Order, {
                foreignKey: 'couponId',
                sourceKey: 'id',
                as: 'orderList',
                scope: {
                    status: {
                        [Op.not]: models.Order.STATUS.CANCEL
                    }
                },
            });
        }
    };
    Coupon.init({
        code: DataTypes.STRING,
        type: DataTypes.INTEGER,
        customerId: DataTypes.INTEGER,
        gifts: DataTypes.JSONB,
        limit: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        minimumRequirement: DataTypes.JSONB,
        startTime: DataTypes.TIMESTAMP,
        endTime: DataTypes.TIMESTAMP,
        createdBy: DataTypes.INTEGER,
        userType: DataTypes.INTEGER,
        discountPrice: DataTypes.JSONB,
        discountPercent: DataTypes.JSONB,
        couponType: DataTypes.INTEGER,
        meta: DataTypes.JSONB,
        desc: DataTypes.TEXT,
        showValue: DataTypes.STRING
    }, {
        sequelize,
        tableName: 'coupons',
        modelName: 'Coupon',
        timestamps: true
    });
    return Coupon
}