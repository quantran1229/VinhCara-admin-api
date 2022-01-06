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

router.put('/menu/:id', jwtValidate, MenuController.putMenuUpdate);

export default router;