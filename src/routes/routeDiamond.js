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
export default router;