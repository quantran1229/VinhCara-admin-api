import Router from 'koa-router';
import {
    CategoryController
} from '../controllers';
import {
    jwtValidate,
    validate
} from '../middlewares';
const router = new Router();

// Get Category list
router.get('/categories', jwtValidate, CategoryController.getCategoryList);
router.get('/categories/:id', jwtValidate, CategoryController.getCategoryInfo);
// Get Category list tree
router.get('/categories/tree', jwtValidate, CategoryController.getCategoryListTree);

router.put('/categories/:id', jwtValidate, CategoryController.putCategoryUpdate);

export default router;