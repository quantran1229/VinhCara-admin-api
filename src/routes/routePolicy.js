import Router from 'koa-router';
import {
    PolicyController
} from '../controllers'

const router = new Router();

// Get Policies list
router.get('/policies', PolicyController.getPolicyList);

// Get Policy info
router.get('/policies/:id', PolicyController.getPolicyInfo);

export default router;