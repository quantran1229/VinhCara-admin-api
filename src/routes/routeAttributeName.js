import Router from 'koa-router';
import {
    AttributeNameController
} from '../controllers'
import {
    jwtValidate,
    validate
} from '../middlewares';

const router = new Router();

// Get attribute names list
router.get('/attributes', jwtValidate, AttributeNameController.getAttributeNameList);

router.get('/attributes/:id', jwtValidate, AttributeNameController.getAttributeInfo);

router.put('/attributes/:id', validate({
    body: {
        showName: 'string?',
        desc: 'string?'
    }
}), jwtValidate, AttributeNameController.putAttributeUpdate);

export default router;