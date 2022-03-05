import Router from 'koa-router';
import TagController from '../controllers/tagController'
import {
    jwtValidate, validate
} from '../middlewares';

const router = new Router();

//get all list tag
router.get('/tags' ,jwtValidate, TagController.getListTags)

router.post('/tags',validate({
    body: {
        link: {
            type: 'string',
            required: true
        },
        title: {
            type: 'string',
            required: true
        },
    }
}), jwtValidate, TagController.postCreateTag)

router.put('/tags/:id', jwtValidate, TagController.putUpdateTag)

router.delete('/tags/:id', jwtValidate, TagController.deleteTag)
export default router;