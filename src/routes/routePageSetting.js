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

router.put('/page-setting-info',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: false
        },
        SEOInfo: {
            type: 'object',
            required: false
        },
        setting: {
            type: 'object',
            required: false
        },
        banner: {
            type: 'object',
            required: false
        },
    }
}) , jwtValidate, PageSettingController.putPageSettingInfo)

router.post('/page-setting-info',validate({
    body: {
        parentId: {
            type: 'number',
            required: false
        },
        name: {
            type: 'string',
            required: false
        },
        link: {
            type: 'string',
            required: true
        },
        SEOInfo: {
            type: 'object',
            required: false
        },
        setting: {
            type: 'object',
            required: false
        },
        banner: {
            type: 'object',
            required: false
        },
    }
}) , jwtValidate, PageSettingController.postPageSettingInfo)

router.delete('/page-setting-info', jwtValidate, PageSettingController.deletePageSettingInfo)

export default router;