import Router from 'koa-router';
import {
    HealthController
} from '../controllers'

const router = new Router();

// Health check
router.get('/check', HealthController.checkHealth);

export default router;