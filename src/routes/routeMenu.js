import Router from 'koa-router';
import {
    MenuController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get Menus list
router.get('/menu', jwtValidate, MenuController.getMenuList);

router.get('/menu/tree', jwtValidate, MenuController.getMenuTreeList);

router.get('/menu/:id', jwtValidate, MenuController.getMenuInfo);

router.put('/menu/:id',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: false
        },
        mediafile: {
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
        buttonText: {
            type: 'string',
            required: false
        },
        order: {
            type: 'number',
            required: false
        },
    }
}) , jwtValidate, MenuController.putMenuUpdate);

router.post('/menu',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: true
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
        buttonText: {
            type: 'string',
            required: false
        },
        order: {
            type: 'number',
            required: false
        },
    }
}) , jwtValidate, MenuController.postMenuCreate);

router.delete('/menu/:id' , jwtValidate, MenuController.deleteMenu);

export default router;