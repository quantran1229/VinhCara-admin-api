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

router.put('/general-info/:type',validate({
    body: {
        name: {
            type: 'string',
            required: false
        },
        setting: {
            type: 'object',
            required: false
        },
    }
}), jwtValidate, GeneralInfoController.putGeneralInfoUpdate)

router.post('/general-info',validate({
    body: {
        id: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: false
        },
        setting: {
            type: 'object',
            required: false
        },
    }
}), jwtValidate, GeneralInfoController.postGeneralInfoCreate)

router.delete('/general-info/:type', jwtValidate, GeneralInfoController.deleteGeneralInfo)

export default router;