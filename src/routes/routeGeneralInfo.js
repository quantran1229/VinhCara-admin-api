import Router from 'koa-router';
import GeneralInfoController from '../controllers/generalInfoController'

const router = new Router();
//get info GeneralInfo
router.get('/general-info/:type', GeneralInfoController.getGeneralInfoByType)

//get all list GeneralInfo
router.get('/general-info', GeneralInfoController.getGeneralInfoAllList)

export default router;