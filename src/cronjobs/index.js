import {
    CronJob
} from 'cron';
import dayjs from 'dayjs';
import db, {
    Order,
    Coupon
} from '../models';
import Logger from '../utils/logger';
import {
    Op
} from 'sequelize';
// ALL CRON JOB HERE

//Check 30 mins after VNPay
var checkVNPay = new CronJob('0 * * * * * *', async function () {
    let orders = await Order.findAll({
        where: {
            paymentMethod: Order.PAYMENT_METHOD.ONLINE,
            status: Order.STATUS.WAITING_FOR_PAYMENT,
            createdAt: {
                [Op.lte]: dayjs().add(-30, 'm').toDate()
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
                    note: orders.note + ' SYSTEM CANCEL DUE TO 30 MINS LATE'
                }, {
                    transaction: transaction
                });

                if (order.couponId) {
                    await Coupon.decrement("count", {
                        transaction: transaction
                    });
                }
            }
            await transaction.commit();
            Logger.info("Total cancel VNPay orders: " + orders.length)
        } catch (err) {
            await transaction.rollback();
            Logger.error('cron: checkVNPay ' + e.message + ' ' + e.stack + ' ' + (e.errors && e.errors[0] ? e.errors[0].message : ''));
        }
    }
});

checkVNPay.start();