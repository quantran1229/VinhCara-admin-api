import Router from 'koa-router';
import {
    CartController
} from '../controllers'
import {
    validate
} from '../middlewares';
import {
    Cart,
    CartItem
} from '../models';
const router = new Router();

// Get Carts info
router.get('/cart', CartController.getCartInfo);

//Post cart
router.post('/cart', validate({
    body: {
        items: {
            type: 'array',
            required: true,
            itemType: 'object',
            rule: {
                productId: 'string',
                type: {
                    type: 'enum',
                    values: Object.values(CartItem.TYPE),
                },
                quantity: {
                    type: 'int?',
                    default: 1
                },
                size: {
                    type: 'string',
                    required: false
                },
                lettering: 'string?',
                gender: {
                    type: 'enum',
                    required: false,
                    values: Object.values(CartItem.GENDER)
                },
                withDiamond: {
                    type: 'array',
                    required: false,
                    rule: {
                        productId: 'string'
                    }
                }
            }
        }
    }
}), CartController.postPutToCart);

//Post cart
router.delete('/cart', CartController.deleteCart);

//Put cart item
router.put('/cart-items/:id', validate({
    body: {
        quantity: {
            type: 'int',
            required: false,
            default: 1
        },
        size: {
            type: 'string',
            required: false
        },
        lettering: 'string?',
        gender: {
            type: 'enum',
            required: false,
            values: Object.values(CartItem.GENDER)
        }
    }
}), CartController.putUpdateItemInCart);

//Delete cart item
router.delete('/cart-items/:id', CartController.deleteItemInCart);
export default router;