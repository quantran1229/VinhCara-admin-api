import Router from 'koa-router';
import {
    UserTypeController
} from '../controllers';
import {
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get UserTypes list
router.get('/user-types', jwtValidate, UserTypeController.getUserTypeList);

// Get UserType info
router.get('/user-types/:id', jwtValidate, UserTypeController.getUserTypeInfo);

// Create new UserType
router.post('/user-types', jwtValidate, UserTypeController.createUserType);

// Update UserType info
router.put('/user-types/:id', jwtValidate, UserTypeController.updateUserType);

// Delete UserType info
router.delete('/user-types/:id', jwtValidate, UserTypeController.deleteUserType);

export default router;