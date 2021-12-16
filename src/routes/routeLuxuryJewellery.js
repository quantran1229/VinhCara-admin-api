import Router from 'koa-router';
import {
    LuxuryJewelleryController
} from '../controllers'

const router = new Router();

// Get luxury jewelleries list
router.get('/luxury-jewelleries', LuxuryJewelleryController.getLuxuryJewelleryList);

// Get luxury jewellery info
router.get('/luxury-jewelleries/:id', LuxuryJewelleryController.getLuxuryJewelleryInfo);

export default router;