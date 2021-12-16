'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Coupon extends Model {
        static TYPE = {
            on_order: 1,
            on_product: 2,
            gift: 3,
            combo: 4,
            product_type: 5
        }
        static SUB_TYPE = {
            use_many_time: 1,
            use_once: 2,
            use_many_time_but_have_limit: 3
        }
        static STATUS = {
            active: 1,
            inactive: -1,
            finished: 2,
            stop: -2
        }
        static getInfo(id) {
            return this.findOne({
                where: {
                    id: id
                },
            })
        }
    };
    Coupon.init({
        code: DataTypes.STRING,
        type: DataTypes.INTEGER,
        desc: DataTypes.STRING,
        subType: DataTypes.INTEGER,
        limit: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        discountPercent: DataTypes.INTEGER,
        discountPrice: DataTypes.BIGINT,
        minimumRequirement: DataTypes.BIGINT,
        maximumDiscount: DataTypes.BIGINT,
        startTime: DataTypes.DATE,
        endTime: DataTypes.DATE,
        createdBy: DataTypes.INTEGER,
        membershipType: DataTypes.ARRAY(DataTypes.INTEGER),
        meta: DataTypes.JSONB,
    }, {
        sequelize,
        tableName: 'coupons',
        modelName: 'Coupon',
        timestamps: true,
    });
    return Coupon
}