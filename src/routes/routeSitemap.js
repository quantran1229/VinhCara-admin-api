import Router from 'koa-router';
import {
    SitemapController
} from '../controllers';
import {
    validate,
    jwtValidate
} from '../middlewares';

const router = new Router();

// Get redirect list
router.get('/sitemaps', jwtValidate, SitemapController.getList);

router.get('/sitemaps/:id', jwtValidate, SitemapController.getInfo);

router.post('/sitemaps', jwtValidate
, validate({
    body: {
        name: {
            type: 'string',
            required: true
        },
        sitemap: {
            type: 'string',
            required: true
        }
    }
})
, SitemapController.postCreate);

router.put('/sitemaps/:id', jwtValidate
, validate({
    body: {
        sitemap: {
            type: 'string',
            required: false
        }
    }
})
, SitemapController.putUpdate);

router.delete('/sitemaps/:id', jwtValidate, SitemapController.deleteRemove);

export default router;