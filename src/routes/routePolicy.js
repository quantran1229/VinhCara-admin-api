import Router from 'koa-router';
import {
    PolicyController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get Policies list
router.get('/policies', jwtValidate, PolicyController.getPolicyList);

// Get Policy info
router.get('/policies/:id', jwtValidate, PolicyController.getPolicyInfo);

router.post('/policies', jwtValidate, validate({
    body: {
        name: 'string',
        slug: 'string',
        body: 'string',
        preview: 'string?',
        body: 'string',
        mediafiles: 'object?'
    }
}), PolicyController.postPolicyCreate);

router.put('/policies/:id', jwtValidate, validate({
    body: {
        name: 'string?',
        slug: 'string?',
        body: 'string?',
        preview: 'string?',
        body: 'string?',
        mediafiles: 'object?'
    }
}), PolicyController.updatePolicyInfo);

router.delete('/policies/:id', jwtValidate, PolicyController.deletePolicy);

export default router;