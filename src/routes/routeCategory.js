import Router from 'koa-router';
import {
    CategoryController
} from '../controllers'
const router = new Router();

// Get Category list
router.get('/categories', CategoryController.getCategoryList);

// Get Category list tree
router.get('/categories/tree', CategoryController.getCategoryListTree);

export default router;