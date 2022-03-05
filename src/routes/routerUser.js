import Router from 'koa-router';
import {
    UserController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';
import {
    User
} from '../models';

const router = new Router();

// Create new User
router.post('/users', validate({
    body: {
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: {
            type: 'email',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        password: {
            type: 'password',
            required: true
        },
        userType: {
            type: 'int?'
        },
        permission: {
            type: 'array',
            required: false,
            itemType: 'string',
            min: 1
        }
    }
}), UserController.postCreateNewUser);

// Login
router.post('/login', validate({
    body: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        }
    }
}), UserController.login);

// Logout
router.get('/logout', jwtValidate, UserController.logout);

router.get('/info', jwtValidate, UserController.getInfo);

// Update info
router.put('/info', validate({
    body: {
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: {
            type: 'email',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        avatar: {
            type: 'string',
            required: false
        }
    }
}), jwtValidate, UserController.putUpdateInfo);

// Update password
router.put('/password', jwtValidate, validate({
    body: {
        oldPassword: 'password',
        newPassword: 'password'
    }
}), UserController.putUpdatePassword);

// User for admin to check

router.get('/users', jwtValidate, UserController.getUsersList);

router.get('/users/:id', jwtValidate, UserController.getUserInfo);

router.put('/users/:id', validate({
    body: {
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: {
            type: 'email',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        avatar: {
            type: 'string',
            required: false
        },
        status: {
            type: 'enum',
            required: false,
            values: Object.values(User.STATUS)
        },
        password: {
            type: 'password',
            required: false
        }
    }
}), jwtValidate, UserController.putUpdateUserInfo);

router.put('/users/:id', validate({
    body: {
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: {
            type: 'email',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        avatar: {
            type: 'string',
            required: false
        },
        status: {
            type: 'enum',
            required: false,
            values: Object.values(User.STATUS)
        },
        password: {
            type: 'password',
            required: false
        }
    }
}), jwtValidate, UserController.putUpdateUserInfo);
export default router;