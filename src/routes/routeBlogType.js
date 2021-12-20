import Router from 'koa-router';
import BLogTypeController from '../controllers/blogTypeController'
import {
    jwtValidate
} from '../middlewares';

const router = new Router();

//get all list blog type
router.get('/blogType' ,jwtValidate, BLogTypeController.getListBlogTypes)

export default router;