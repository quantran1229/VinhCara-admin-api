import Router from 'koa-router';
import {
    PageController
} from '../controllers'

const router = new Router();

// Get Page list
router.get('/pages', PageController.getPageList);

// Get Page info
router.get('/pages/:id', PageController.getPageInfo);

export default router;