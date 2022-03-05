import Router from 'koa-router';
import {
    LuxuryJewelleryController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';
import {
    LuxuryJewellery
} from '../models';

const router = new Router();

// Get luxury jewelleries list
router.get('/luxury-jewelleries', jwtValidate, LuxuryJewelleryController.getLuxuryJewelleryList);

// Get luxury jewellery info
router.get('/luxury-jewelleries/:id', jwtValidate, LuxuryJewelleryController.getLuxuryJewelleryInfo);

// Update
router.put('/luxury-jewelleries/:id', jwtValidate, validate({
    body: {
        slug: 'string?',
        productCode: 'string?',
        gender: {
            type: 'enum',
            required: false,
            values: Object.values(LuxuryJewellery.GENDER)
        },
        status: {
            type: 'enum',
            required: false,
            values: Object.values(LuxuryJewellery.STATUS)
        },
        mediafiles: 'object?',
        blocks: 'object?',
        SEOInfo: 'object?',
        text: 'string?',
        name: 'string?'
    }
}), LuxuryJewelleryController.putLuxuryJewelleryUpdate);

router.post('/luxury-jewelleries', jwtValidate, validate({
    body: {
        slug: 'string',
        productCode: 'string',
        gender: {
            type: 'enum',
            required: true,
            values: Object.values(LuxuryJewellery.GENDER)
        },
        status: {
            type: 'enum',
            required: false,
            values: Object.values(LuxuryJewellery.STATUS)
        },
        mediafiles: 'object?',
        blocks: 'object?',
        SEOInfo: 'object?',
        text: 'string?',
        name: 'string'
    }
}), LuxuryJewelleryController.postLuxuryJewelleryCreate);

router.delete('/luxury-jewelleries/:id', jwtValidate, LuxuryJewelleryController.deleteLuxuryJewellery);
export default router;