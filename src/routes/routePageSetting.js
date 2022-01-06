import Router from 'koa-router';
import {
    PageSettingController
} from '../controllers'
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get Page list
router.get('/page-settings', jwtValidate, PageSettingController.getPageSettingList);

// Get Page info
router.get('/page-setting-info', jwtValidate, PageSettingController.getPageSettingInfo);

router.put('/page-setting-info', jwtValidate, PageSettingController.putPageSettingInfo)

export default router;