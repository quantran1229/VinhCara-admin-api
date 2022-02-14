import Router from 'koa-router';
import {
    ComboController
} from '../controllers'
import {
    jwtValidate, validate
} from '../middlewares';

const router = new Router();

// Get combo list
router.get('/combo', jwtValidate, ComboController.getComboList);

// Get combo info
router.get('/combo/:id', jwtValidate, ComboController.getComboInfo);

router.post('/combo',validate({
    body: {
        link: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        productCode: {
            type: 'array',
            required: true,
            itemType: 'string'
        },
        SEOInfo: {
            type: 'object',
            required: false
        },
        bannerInfo: {
            type: 'object',
            required: false
        },
        status: {
            type: 'number',
            required: false
        },
    }
}), jwtValidate, ComboController.postCreateCombo)

router.put('/combo/:id',validate({
    body: {
        link: {
            type: 'string',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        productCode: {
            type: 'array',
            required: false,
            itemType: 'string'
        },
        SEOInfo: {
            type: 'object',
            required: false
        },
        bannerInfo: {
            type: 'object',
            required: false
        },
        status: {
            type: 'number',
            required: false
        },
    }
}), jwtValidate, ComboController.putUpdateCombo)

router.delete('/combo/:id', jwtValidate, ComboController.deleteCombo)

router.delete('/combo/:id/:jewelleryId', jwtValidate, ComboController.deleteJewelleryInCombo)

export default router;