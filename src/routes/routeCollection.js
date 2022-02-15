import Router from 'koa-router';
import {
    CollectionController
} from '../controllers'
import {
    jwtValidate, validate
} from '../middlewares';

const router = new Router();

// Get collection list
router.get('/collections', CollectionController.getCollectionList);

// Get collection jewellery list
router.get('/collections/:id/jewellery', CollectionController.getCollectionJewelleryList);

// Get collection info
router.get('/collections/:id', CollectionController.getCollectionInfo);

// Get current collection
router.get('/current-collection', CollectionController.getCurrentCollection);

// Get current collection jewellery list
router.get('/current-collection/jewellery', CollectionController.getCurrentCollectionJewelleryList);

router.post('/collections',validate({
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
}), jwtValidate, CollectionController.postCreateCollection)

router.put('/collections/:id',validate({
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
}), jwtValidate, CollectionController.putUpdateCollection)

router.delete('/collections/:id', jwtValidate, CollectionController.deleteCollection)

router.delete('/collections/:id/:jewelleryId', jwtValidate, CollectionController.deleteJewelleryInCollection)

export default router;