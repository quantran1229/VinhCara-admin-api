import Router from 'koa-router';
import StoreContactController from '../controllers/storeContactController'

const router = new Router();
//get info store contact
router.get('/store-contacts/:id', StoreContactController.getStoreContactInfo)

router.get('/store-contacts', StoreContactController.getList)

export default router;