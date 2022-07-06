import Router from 'koa-router';
import {
    SEOController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get redirect list
router.get('/SEO', jwtValidate, SEOController.getList);

// Get redirect info
router.get('/SEO/:id', jwtValidate, SEOController.getInfo);

// Create
router.post('/SEO', jwtValidate, SEOController.postCreate);

// Update
router.put('/SEO/:id', jwtValidate, SEOController.putUpdate);

// Delete
router.delete('/SEO/:id', jwtValidate, SEOController.delete);
export default router;