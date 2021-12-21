import Router from 'koa-router';
import StoreContactController from '../controllers/storeContactController'
import {
    jwtValidate, validate
} from '../middlewares';

const router = new Router();
//get info store contact
router.get('/store-contacts/:id',jwtValidate, StoreContactController.getStoreContactInfo)

router.get('/store-contacts',jwtValidate, StoreContactController.getList)

router.post('/store-contacts',validate({
    body: {
        name: {
            type: 'string',
            required: true
        },
        openTime: {
            type: 'array',
            itemType: 'object',
            min: 1,
            required: true
        },
        phone: {
            type: 'array',
            required: true,
            itemType: 'string',
            min: 1
        },
        stockId: {
            type: 'number',
            required: true
        },
        providenceId: {
            type: 'string',
            required: true
        },
        cityId: {
            type: 'string',
            required: true
        },
        districtId: {
            type: 'string',
            required: true
        },
        address: {
            type: 'string',
            required: false
        },
        status:  {
            type: 'number',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        directionLink: {
            type: 'string',
            required: true
        },
    }
}),jwtValidate, StoreContactController.postCreateStoreContact)

router.put('/store-contacts/:id',validate({
    body: {
        name: {
            type: 'string',
            required: false
        },
        openTime: {
            type: 'array',
            itemType: 'object',
            min: 1,
            required: false
        },
        phone: {
            type: 'array',
            required: false,
            itemType: 'string',
            min: 1
        },
        stockId: {
            type: 'number',
            required: false
        },
        providenceId: {
            type: 'string',
            required: false
        },
        cityId: {
            type: 'string',
            required: false
        },
        districtId: {
            type: 'string',
            required: false
        },
        address: {
            type: 'string',
            required: false
        },
        status:  {
            type: 'number',
            required: false
        },
        meta: {
            type: 'object',
            required: false
        },
        mediafiles: {
            type: 'object',
            required: false
        },
        directionLink: {
            type: 'string',
            required: false
        },
    }
}),jwtValidate, StoreContactController.putUpdateStoreContact)

router.delete('/store-contacts/:id',jwtValidate, StoreContactController.deleteStoreContact)
export default router;