import Router from 'koa-router';
import BLogTypeController from '../controllers/blogTypeController'
import {
    jwtValidate, validate
} from '../middlewares';

const router = new Router();

//get all list blog type
router.get('/blogType' ,jwtValidate, BLogTypeController.getListBlogTypes)

router.post('/blogType',validate({
    body: {
        slug: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
    }
}), jwtValidate, BLogTypeController.postCreateBlogType)

router.put('/blogType/:id', jwtValidate, BLogTypeController.putUpdateBlogType)

router.delete('/blogType/:id', jwtValidate, BLogTypeController.deleteBlogType)

export default router;