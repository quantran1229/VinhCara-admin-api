import Router from 'koa-router';
import {
    ReturnFormController
} from '../controllers'
import {
    validate
} from '../middlewares';
import {
    ReturnForm
} from '../models';
const router = new Router();

// create return form
router.post('/return-forms', validate({
    body: {
        name: "string",
        phone: {
            type: 'string',
            required: false,
            format: /^\d+$/
        },
        email: "email",
        code: {
            type: "string",
            format: /^\d{6}[12]\w{5}$/
        },
        reason: {
            type: 'enum',
            values: Object.values(ReturnForm.REASON)
        },
    }
}), ReturnFormController.postCreateNewReturnForm);

export default router;