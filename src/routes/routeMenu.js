import Router from 'koa-router';
import {
    MenuController
} from '../controllers'

const router = new Router();

// Get Menus list
router.get('/menu', MenuController.getMenuList);

export default router;