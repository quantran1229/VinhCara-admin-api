import Router from 'koa-router';
import {
    DiamondController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';
const router = new Router();

// Get Diamond list
router.get('/diamonds', jwtValidate, DiamondController.getDiamondList);

router.get('/diamond-serials', jwtValidate, DiamondController.getDiamondSerialList);

// Get Diamond info
router.get('/diamonds/:id', jwtValidate, DiamondController.getDiamondInfo);

// Get Diamond info
router.put('/diamonds/all', jwtValidate, DiamondController.putDiamondUpdateAll);

// put Diamond info
router.put('/diamonds/:id', jwtValidate, DiamondController.putDiamondUpdate);

router.get('/diamond-serials/:id', jwtValidate, DiamondController.getDiamondSerialInfo);

router.delete('/diamond-serials/:id', jwtValidate, DiamondController.deleteDiamondSerial);

router.put('/diamond-serials/:id', jwtValidate, validate({
    body: {
        caraWeight: 'string?',
        clarity: 'string?',
        color: 'string?',
        cut: 'string?',
        extraProperties: 'object?',
        measurements: 'string?',
        price: 'int?',
        shape: 'string?',
        size: 'string?',
        GIAReportNumber: 'string?'
    }
}), DiamondController.putDiamondSerialUpdate);

router.post('/diamond-serials', jwtValidate, validate({
    body: {
        serial: 'string',
        productOdooId: 'int',
        caraWeight: 'string?',
        clarity: 'string?',
        color: 'string?',
        cut: 'string?',
        extraProperties: 'object?',
        measurements: 'string?',
        price: 'int?',
        shape: 'string?',
        size: 'string?',
        GIAReportNumber: 'string?'
    }
}), DiamondController.postDiamondSerialCreate);
export default router;