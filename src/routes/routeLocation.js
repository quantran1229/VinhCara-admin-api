import Router from 'koa-router';
import {
    LocationController
} from '../controllers'

const router = new Router();

// Get locations list
router.get('/locations', LocationController.getLoctationList);

// Get location info
router.get('/locations/:id', LocationController.getLoctationInfo);

export default router;