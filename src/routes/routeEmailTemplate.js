import Router from 'koa-router';
import EmailTemplateController from '../controllers/emailTemplateController';
import {
    jwtValidate,
    validate
} from '../middlewares';
const router = new Router();

// Get Category list
router.get('/emailTemplates', jwtValidate, EmailTemplateController.getListEmailTemplates);
router.get('/emailTemplates/:id', jwtValidate, EmailTemplateController.getEmailTemplateInfo);
// // Get Category list tree
//
router.put('/emailTemplates/:id',validate({
    body: {
        body: {
            type: 'string',
            required: false
        },
        title: {
            type: 'string',
            required: false
        },
    }
}), jwtValidate, EmailTemplateController.putEmailTemplateUpdate);
//
router.post('/emailTemplates',validate({
    body: {
        body: {
            type: 'string',
            required: false
        },
        title: {
            type: 'string',
            required: false
        },
    }
}), jwtValidate, EmailTemplateController.postEmailTemplateCreate);

router.delete('/emailTemplates/:id', jwtValidate, EmailTemplateController.deleteEmailTemplate);

export default router;

