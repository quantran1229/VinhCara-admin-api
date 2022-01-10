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

router.get('/jewellery-serials', jwtValidate, JewelleryController.getJewellerySerialList);

router.get('/jewellery-serials/:id', jwtValidate, JewelleryController.getJewellerySerialInfo);

router.delete('/jewellery-serials/:id', jwtValidate, JewelleryController.deleteJewellerySerial);

router.get('/jewellery-categories', jwtValidate, JewelleryController.getJewelleryCategoryList);

router.put('/jewellery-categories/:id', jwtValidate, validate({
    body: {
        size: 'array?',
        defaultSize: 'string?',
        calculateSize: 'object?'
    }
}), JewelleryController.putJewelleryCategoryUpdate);

router.put('/jewellery-serials/:id', jwtValidate, validate({
    body: {
        designForm: 'string?',
        diamondSize: 'number?',
        hasDiamond: 'int?',
        gemstone: 'string?',
        goldProperty: 'string?',
        price: 'int?',
        size: 'string?',
        gender: 'int?',
        extraProperties: 'object?',
        shape: 'string?'
    }
}), JewelleryController.putJewellerySerialUpdate);

router.post('/jewellery-serials', jwtValidate, validate({
    body: {
        serial: 'string',
        productOdooId: 'int',
        designForm: 'string?',
        diamondSize: 'number?',
        hasDiamond: 'int?',
        gemstone: 'string?',
        goldProperty: 'string?',
        price: 'int?',
        size: 'string?',
        gender: 'int?',
        extraProperties: 'object?',
        shape: 'string?'
    }
}), JewelleryController.postJewellerySerialCreate);
export default router;