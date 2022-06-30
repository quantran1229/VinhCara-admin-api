import {
    CronJob
} from 'cron';
import dayjs from 'dayjs';
import db, {
    Order,
    Coupon,
    Blog,
    Jewellery,
    JewellerySerial
} from '../models';
import Logger from '../utils/logger';
import {
    Op
} from 'sequelize';
// ALL CRON JOB HERE

//Check 30 mins after VNPay
var checkVNPay = new CronJob('0 * * * * *', async function () {
    Logger.info("Start check for VNPay due 35 mins");
    let orders = await Order.findAll({
        where: {
            paymentMethod: Order.PAYMENT_METHOD.ONLINE,
            status: Order.STATUS.WAITING_FOR_PAYMENT,
            createdAt: {
                [Op.lte]: dayjs().add(-35, 'm').toDate()
            }
        }
    });
    if (orders.length > 0) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            for (let order of orders) {
                let logs = JSON.parse(JSON.stringify(order.logs));
                let meta = JSON.parse(JSON.stringify(order.meta));
                delete meta["paymentList"];
                logs.push({
                    by: '0',
                    id: logs.length,
                    createdAt: dayjs().unix(),
                    status: Order.STATUS.CANCEL
                });
                await order.update({
                    logs: logs,
                    status: Order.STATUS.CANCEL,
                    meta: meta,
                    note: order.note + ' SYSTEM CANCEL DUE TO 30 MINS LATE'
                }, {
                    transaction: transaction
                });

                if (order.couponId) {
                    await Coupon.decrement("count", {
                        where: {
                            id: order.couponId
                        },
                        transaction: transaction
                    });
                }
            }
            await transaction.commit();
            Logger.info("Total cancel VNPay orders: " + orders.length)
        } catch (err) {
            await transaction.rollback();
            Logger.error('cron: checkVNPay ' + err.message + ' ' + err.stack + ' ' + (err.errors && err.errors[0] ? err.errors[0].message : ''));
        }
    }
});

checkVNPay.start();

var recalculatePrice = new CronJob('*/30 * * * * *', async function () {
    Logger.info("Recalculate price");
    let list = await Jewellery.findAll({
        where: {
            isShowOnWeb: true,
            isLuxury: false
        },
        attributes: ['productCode', 'price', 'type', 'isHiddenPrice'],
        include: [{
            model: JewellerySerial,
            as: 'serialList',
            required: false,
            attributes: ['type', 'price', 'gender','size']
        }],
        order: [
            [{
                model: JewellerySerial,
                as: 'serialList',
            }, 'type', 'ASC'],
            [{
                model: JewellerySerial,
                as: 'serialList',
            }, 'price', 'ASC']
        ],
        logging: false
    });
    for (let jew of list) 
    {
        if (jew.isHiddenPrice && jew.price != null)
        {
            await jew.update({
                price: null
            }, {
                logging: false
            });
            continue
        }
        if (jew.serialList.length > 0 && !jew.isHiddenPrice) {
            if (jew.type == Jewellery.TYPE.DOUBLE) {
                let price = (jew.serialList.find(e => e.gender == 1) ? parseInt(jew.serialList.find(e => e.gender == 1).price) : 0) + (jew.serialList.find(e => e.gender == 2) ? parseInt(jew.serialList.find(e => e.gender == 2).price) : 0);
                await jew.update({
                    price: price
                }, {
                    logging: false
                });
            } else {
                if (jew.price != jew.serialList[0].price)
                await jew.update({
                    price: jew.serialList[0].price,
                    size: jew.serialList[0].size
                }, {
                    logging: false
                })
            }
        } else {
            await jew.update({
                price: null
            }, {
                logging: false
            });
        }
    }
    Logger.info("Recalculate price done");
});

recalculatePrice.start();

// Activate Coupon
var activateCoupon = new CronJob('0 * * * * *', async function () {
    Logger.info("Start check for Coupon to start");
    let coupons = await Coupon.findAll({
        where: {
            status: Coupon.STATUS.INACTIVE,
            endTime: {
                [Op.or]: [{
                    [Op.not]: null,
                }, {
                    [Op.gte]: dayjs().add(-1, 's').toISOString()
                }]
            }
        }
    });
    if (coupons.length > 0) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await Coupon.update({
                status: Coupon.STATUS.ACTIVE
            }, {
                where: {
                    id: {
                        [Op.in]: coupons.map(e => e.id)
                    }
                },
                transaction
            })
            await transaction.commit();
            Logger.info("Total activate coupons: " + coupons.length)
        } catch (err) {
            await transaction.rollback();
            Logger.error('cron: activateCoupon ' + err.message + ' ' + err.stack + ' ' + (err.errors && err.errors[0] ? err.errors[0].message : ''));
        }
    }
});

activateCoupon.start();

// Deactivate Coupon
var deactivateCoupon = new CronJob('0 * * * * *', async function () {
    Logger.info("Start check for Coupon to end");
    let coupons = await Coupon.findAll({
        where: {
            status: Coupon.STATUS.ACTIVE,
            endTime: {
                [Op.lte]: dayjs().add(-1, 's').toISOString()
            }
        }
    });
    if (coupons.length > 0) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await Coupon.update({
                status: Coupon.STATUS.FINISHED
            }, {
                where: {
                    id: {
                        [Op.in]: coupons.map(e => e.id)
                    }
                },
                transaction
            })
            await transaction.commit();
            Logger.info("Total deactivate coupons: " + coupons.length)
        } catch (err) {
            await transaction.rollback();
            Logger.error('cron: activateCoupon ' + err.message + ' ' + err.stack + ' ' + (err.errors && err.errors[0] ? err.errors[0].message : ''));
        }
    }
});

deactivateCoupon.start();

var activateBlog = new CronJob('0 * * * * *', async function () {
    Logger.info("Start check for blog to start");
    let blogs = await Blog.findAll({
        where: {
            status: Blog.STATUS.INACTIVE,
            publishAt: {
                [Op.not]: null,
                [Op.lte]: dayjs().add(-1, 's').toISOString()
            }
        }
    });
    if (blogs.length > 0) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await Blog.update({
                status: Blog.STATUS.ACTIVE
            }, {
                where: {
                    id: {
                        [Op.in]: blogs.map(e => e.id)
                    }
                },
                transaction
            })
            await transaction.commit();
            Logger.info("Total activate coupons: " + blogs.length)
        } catch (err) {
            await transaction.rollback();
            Logger.error('cron: activateBlog ' + err.message + ' ' + err.stack + ' ' + (err.errors && err.errors[0] ? err.errors[0].message : ''));
        }
    }
});
activateBlog.start();