import Router from 'koa-router';
import {
    NotFoundController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get redirect list
router.get('/404', jwtValidate, NotFoundController.getList);

router.delete('/404/:id', jwtValidate, NotFoundController.deleteLogs);

export default router;