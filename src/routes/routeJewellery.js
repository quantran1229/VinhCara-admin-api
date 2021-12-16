import Router from 'koa-router';
import {
    JewelleryController
} from '../controllers';
const router = new Router();

// Get jewellery list
router.get('/jewellery', JewelleryController.getJewelleryList);

// Get new jewellery list
router.get('/jewellery/new', JewelleryController.getNewJewellery);

// get filter list
router.get('/jewellery/filter', JewelleryController.getJewelleryFilterList);

// Get jewellery info
router.get('/jewellery/:id', JewelleryController.getJewelleryInfo);

// Get jewellery category
router.get('/jewellery-category', JewelleryController.getJewelleryCategoryList);
export default router;