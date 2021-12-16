import Router from 'koa-router';
import {
    PageSettingController
} from '../controllers'

const router = new Router();

// Get Page list
router.get('/page-settings', PageSettingController.getPageSettingList);

// Get Page info
router.get('/page-setting-info', PageSettingController.getPageSettingInfo);

export default router;