import Router from 'koa-router';
import TagController from '../controllers/tagController'
import {
    jwtValidate
} from '../middlewares';

const router = new Router();

//get all list tag
router.get('/tags' ,jwtValidate, TagController.getListTags)

export default router;