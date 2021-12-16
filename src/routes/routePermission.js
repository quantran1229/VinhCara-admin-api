import Router from 'koa-router';
import {
    PermissionController
} from '../controllers';
import {
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get Permissions list
router.get('/permissions', jwtValidate, PermissionController.getPermissionList);

// Get Permission info
router.get('/permissions/:id', jwtValidate, PermissionController.getPermissionInfo);

export default router;