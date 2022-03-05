import Router from 'koa-router';
import CouponController from '../controllers/couponController';
import {
    jwtValidate,
    validate
} from '../middlewares';
import {
    Coupon
} from '../models';

const router = new Router();
//get info Coupon
router.get('/coupons/:id', jwtValidate, CouponController.getCouponInfo);

//get all list Coupon
router.get('/coupons', jwtValidate, CouponController.getListCoupon);

// create coupon
router.post('/coupons', jwtValidate,
    validate({
        body: {
            code: 'string',
            type: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.TYPE)
            },
            customerId: 'int?',
            gifts: {
                type: 'array',
                required: false
            },
            status: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.STATUS)
            },
            startTime: 'datetime?',
            endTime: 'datetime?',
            userType: {
                type: 'enum',
                required: true,
                values: Object.values(Coupon.USER_TYPE)
            },
            discountPrice: {
                type: 'object',
                required: false,
                rule: {
                    value: 'int?',
                    diamond: 'object?',
                    jewellery: 'object?'
                }
            },
            discountPercent: {
                type: 'object',
                required: false,
                rule: {
                    value: 'int?',
                    diamond: 'object?',
                    jewellery: 'object?',
                    maximum: 'int?'
                }
            },
            couponType: {
                type: 'enum',
                required: true,
                values: Object.values(Coupon.COUPON_TYPE)
            },
            minimumRequirement: {
                type: 'object',
                rule: {
                    value: 'int?',
                    diamond: 'int?',
                    jewellery: 'int?',
                }
            },
            limit: 'int?',
            desc: 'string?',
            showValue: 'string?'
        }
    }),
    CouponController.postCouponCreate);
// Update
router.put('/coupons/:id', jwtValidate,
    validate({
        body: {
            code: 'string?',
            type: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.TYPE)
            },
            customerId: 'int?',
            gifts: {
                type: 'array',
                required: false,
            },
            status: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.STATUS)
            },
            startTime: 'datetime?',
            endTime: 'datetime?',
            userType: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.USER_TYPE)
            },
            discountPrice: {
                type: 'object',
                required: false,
                rule: {
                    value: 'int?',
                    diamond: 'object?',
                    jewellery: 'object?'
                }
            },
            discountPercent: {
                type: 'object',
                required: false,
                rule: {
                    value: 'int?',
                    diamond: 'object?',
                    jewellery: 'object?',
                    maximum: 'int?'
                }
            },
            couponType: {
                type: 'enum',
                required: false,
                values: Object.values(Coupon.COUPON_TYPE)
            },
            minimumRequirement: {
                type: 'object?',
                rule: {
                    value: 'int?',
                    diamond: 'int?',
                    jewellery: 'int?',
                }
            },
            limit: 'int?',
            desc: 'string?',
            showValue: 'string?'
        }
    }),
    CouponController.putCouponUpdate);

router.delete('/coupons/:id', jwtValidate, CouponController.deleteCoupon);
export default router;