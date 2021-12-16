import Router from 'koa-router';
import {
    ComboController
} from '../controllers'
const router = new Router();

// Get combo list
router.get('/combo', ComboController.getComboList);

// Get combo info
router.get('/combo/:id', ComboController.getComboInfo);

export default router;