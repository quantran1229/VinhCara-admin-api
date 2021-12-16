import Router from 'koa-router';
import {
    SavedAddressController
} from '../controllers';
import {
    SavedAddress
} from '../models';
import {
    jwtValidate,
    validate
} from '../middlewares';

const router = new Router();

// get list
router.get('/saved-addresses', jwtValidate, SavedAddressController.getListSavedAddresses);

// get default save address
router.get('/saved-addresses/default', jwtValidate, SavedAddressController.getDefaultAddressInfo);

// get address info
router.get('/saved-addresses/:id', jwtValidate, SavedAddressController.getAddressInfo);

// get address info
router.post('/saved-addresses', jwtValidate, validate({
    body: {
        recieverName: {
            type: 'string'
        },
        phone: {
            type: 'string',
            format: /^\d+$/
        },
        type: {
            type: 'enum',
            values: Object.values(SavedAddress.TYPE)
        },
        isDefault: 'boolean',
        address: 'string',
        providenceId: {
            type: 'int',
            min: 1,
            max: 10000
        },
        cityId: {
            type: 'int',
            min: 1,
            max: 10000
        },
        districtId: {
            type: 'int',
            min: 1,
            max: 10000
        }
    }
}), SavedAddressController.postCreateNewAddress);

// update address info 
router.put('/saved-addresses/:id', jwtValidate, validate({
    body: {
        recieverName: {
            type: 'string',
            required: false
        },
        phone: {
            type: '!string',
            format: /^\d+$/,
            required: false
        },
        type: {
            type: '!enum',
            required: false,
            values: Object.values(SavedAddress.TYPE)
        },
        isDefault: 'boolean?',
        address: 'string?',
        providenceId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        },
        cityId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        },
        districtId: {
            type: 'int',
            min: 1,
            max: 10000,
            required: false
        }
    }
}), SavedAddressController.putUpdateSavedAddress);

// delete address info
router.delete('/saved-addresses/:id', jwtValidate, SavedAddressController.deleteSavedAddress);

export default router;