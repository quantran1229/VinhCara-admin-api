import Router from 'koa-router';
import {
    JewelleryController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get jewellery list
router.get('/jewellery', jwtValidate, JewelleryController.getJewelleryList);

// // Get new jewellery list
// router.get('/jewellery/new', JewelleryController.getNewJewellery);

// // get filter list
// router.get('/jewellery/filter', JewelleryController.getJewelleryFilterList);

// // Get jewellery info
router.get('/jewellery/:id', jwtValidate, JewelleryController.getJewelleryInfo);

router.put('/jewellery/all', jwtValidate, validate({
    body: {
        mediafiles: 'object?',
        bannerInfo: 'object?',
        SEOInfo: 'object?',
        keywords: 'string?',
        desc: 'string?',
        isShowOnWeb: 'boolean?',
    }
}), JewelleryController.putJewelleryUpdateAll);

// // Get jewellery info
router.put('/jewellery/:id', jwtValidate, validate({
    body: {
        designForm: 'string?',
        diamondSize: 'number?',
        hasDiamond: 'int?',
        gemstone: 'string?',
        goldProperty: 'string?',
        price: 'int?',
        extraProperties: 'object?',
        mediafiles: 'object?',
        bannerInfo: 'object?',
        SEOInfo: 'object?',
        keywords: 'string?',
        desc: 'string?',
        isShowOnWeb: 'boolean?',
        shape: 'string?'
    }
}), JewelleryController.putJewelleryUpdate);

// // Get jewellery category
router.get('/jewellery-category', jwtValidate, JewelleryController.getJewelleryCategoryList);
export default router;