import Router from 'koa-router';
import CouponController from '../controllers/couponController'

const router = new Router();
//get info Coupon
router.get('/coupon/:id', CouponController.getCouponInfo)

//get all list Coupon
router.get('/coupon', CouponController.getListCoupon)

export default router;