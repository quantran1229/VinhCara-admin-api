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

router.put('/categories/:id',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        desc: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: false
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        status: {
            type: 'number',
            required: false
        },
        type: {
            type: 'number',
            required: false
        },
    }
}), jwtValidate, CategoryController.putCategoryUpdate);

router.post('/categories',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: true
        },
        desc: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: false
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        status: {
            type: 'number',
            required: false
        },
        type: {
            type: 'number',
            required: false
        },
    }
}), jwtValidate, CategoryController.postCategoryCreate);

router.delete('/categories/:id', jwtValidate, CategoryController.deleteCategory);

export default router;

