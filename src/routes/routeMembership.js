import Router from 'koa-router';
import {
    MembershipController
} from '../controllers'

const router = new Router();

// get list of all membership
router.get('/memberships', MembershipController.getMembershipList);

// search membership
router.get('/customer-memberships/:id', MembershipController.getCustomerMembership);

export default router;