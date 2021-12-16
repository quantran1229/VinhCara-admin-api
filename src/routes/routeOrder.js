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

// // Post create new order
// router.post('/orders', jwtOrSessionValidate, validate({
//     body: {
//         recieverName: 'string', // Tên
//         phone: {
//             type: 'string',
//             required: false,
//             format: /^\d+$/
//         },
//         email: {
//             type: 'email',
//             required: false
//         },
//         address: 'string?',
//         providenceId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         }, //id của tỉnh
//         cityId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         }, // id huyện ,quận
//         districtId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         }, //id huyện xã phường
//         shippingType: {
//             type: 'enum',
//             values: Object.values(Order.SHIPPING_TYPE)
//         },
//         paymentMethod: {
//             type: 'enum',
//             values: Object.values(Order.PAYMENT_METHOD)
//         },
//         isGift: {
//             type: 'boolean',
//             required: false
//         },
//         giftRecieverName: 'string?',
//         giftPhone: {
//             type: 'string',
//             required: false,
//             format: /^\d+$/
//         },
//         giftAddress: 'string?',
//         giftProvidenceId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         },
//         giftCityId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         },
//         giftDistrictId: {
//             type: 'int',
//             min: 1,
//             max: 10000,
//             required: false
//         }
//     }
// }), OrderController.postNewOrder);

// Get list order
router.get('/orders', OrderController.getOrderList);

// Get info of order
router.get('/orders/:id', OrderController.getOrderInfo);

export default router;