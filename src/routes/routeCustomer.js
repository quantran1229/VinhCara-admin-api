import Router from 'koa-router';
import {
    CustomerController
} from '../controllers';
import {
    Customer
} from '../models';
import {
    jwtValidate,
    validate
} from '../middlewares';

const router = new Router();

// Get Customers list
router.get('/customers', jwtValidate, CustomerController.getCustomerList);

// Get location info
router.get('/customers/:id', jwtValidate, CustomerController.getCustomerInfo);

router.put('/customers/:id', jwtValidate, validate({
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
        gender: {
            type: 'enum',
            required: false,
            values: Object.values(Customer.GENDER)
        },
        maritalStatus: {
            type: 'enum',
            required: false,
            values: Object.values(Customer.MARITALSTATUS)
        },
        dob: {
            type: 'date',
            required: false
        },
        avatar: {
            type: 'string',
            required: false
        },
        password: {
            type: 'password',
            required: false
        }
    }
}), CustomerController.putCustomerInfo);

export default router;