import Router from 'koa-router';
import {
    WishlistController
} from '../controllers';
import {
    jwtValidate,
    validate
} from '../middlewares';
import WishlistLog from '../models';

const router = new Router();
// add to wishlist
router.post('/wishlist', validate({
    body: {
        id: 'string',
        type: {
            type: 'enum',
            values: [1, 2]
        }
    }
}), jwtValidate, WishlistController.postAddWishlist);

// get wishlist
router.get('/wishlist', jwtValidate, WishlistController.getWishList);

// delete wishlist
router.delete('/wishlist', jwtValidate, WishlistController.deleteWishlist);
export default router;