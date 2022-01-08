import Router from 'koa-router';
import {
    OrderController
} from '../controllers'
import {
    validate,
    jwtValidate
} from '../middlewares';
import {
    Order,
    OrderItem
} from '../models';
const router = new Router();

// Get list order
router.get('/orders', jwtValidate, OrderController.getOrderList);

// Get info of order
router.get('/orders/:id', jwtValidate, OrderController.getOrderInfo);

router.put('/orders/:id', jwtValidate, validate({
    body: {
        recieverName: 'string?', // Tên
        note: 'string?',
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: {
            type: 'email',
            required: false
        },
        address: 'string?',
        providenceId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        }, //id của tỉnh
        cityId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        }, // id huyện ,quận
        districtId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        }, //id huyện xã phường
        isGift: {
            type: 'boolean',
            required: false
        },
        giftRecieverName: 'string?',
        giftPhone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        giftAddress: 'string?',
        giftProvidenceId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        },
        giftCityId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        },
        giftDistrictId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        },
        status: {
            type: 'enum?',
            values: Object.values(Order.STATUS)
        },
        paymentInfo: {
            type: 'object?'
        }
    }
}), OrderController.putOrderInfo);

export default router;