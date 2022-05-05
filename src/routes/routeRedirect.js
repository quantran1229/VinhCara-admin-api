import Router from 'koa-router';
import {
    RedirectController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get redirect list
router.get('/redirects', jwtValidate, RedirectController.getList);

// Get redirect info
router.get('/redirects/:id', jwtValidate, RedirectController.getInfo);

// Create
router.post('/redirects', jwtValidate, RedirectController.postCreate);

// Update
router.put('/redirects/:id', jwtValidate, RedirectController.putUpdate);

// Delete
router.delete('/redirects/:id', jwtValidate, RedirectController.delete);

export default router;