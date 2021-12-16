import Router from 'koa-router';
import {
    AttributeNameController
} from '../controllers'

const router = new Router();

// Get attribute names list
router.get('/attributes', AttributeNameController.getAttributeNameList);

export default router;