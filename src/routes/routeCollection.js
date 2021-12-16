import Router from 'koa-router';
import {
    CollectionController
} from '../controllers'
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

export default router;