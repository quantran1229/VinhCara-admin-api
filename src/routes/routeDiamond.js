import Router from 'koa-router';
import {
    DiamondController
} from '../controllers';
const router = new Router();

// Get Diamond list
router.get('/diamonds', DiamondController.getDiamondList);

// Get Diamond info
router.get('/diamonds/:id', DiamondController.getDiamondInfo);

// Get Diamond info
router.get('/diamonds/:id/jewellery', DiamondController.getJewelleryForDiamonds);

// Get Diamond info
router.get('/diamonds/:id/jewellery-count', DiamondController.getCountJewelleryForDiamonds);

export default router;