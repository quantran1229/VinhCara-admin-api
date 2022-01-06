import Router from 'koa-router';
import GeneralInfoController from '../controllers/generalInfoController'
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();
//get info GeneralInfo
router.get('/general-info/:type', jwtValidate, GeneralInfoController.getGeneralInfoByType)

//get all list GeneralInfo
router.get('/general-info', jwtValidate, GeneralInfoController.getGeneralInfoAllList);

router.put('/general-info/:type', jwtValidate, GeneralInfoController.putGeneralInfoUpdate)

export default router;