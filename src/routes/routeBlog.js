import Router from 'koa-router';
import BlogController from '../controllers/blogController'
import {
    jwtValidate, validate
} from '../middlewares';
import {buildSlug} from "../utils/utils";
const router = new Router();
//get info blog
router.get('/blogs/:id', jwtValidate, BlogController.getBlogInfo)

//get all list blog
router.get('/blogs', jwtValidate, BlogController.getListBlogs)

// create blog
router.post('/blogs',validate({
    body: {
        slug: {
            type: 'string',
            required: true
        },
        publishAt: {
            type: 'string',
            required: true
        },
        tagIds: {
            type: 'array',
            required: true,
            itemType: 'number',
            min: 1
        }
    }
}), jwtValidate, BlogController.postCreateNewBlog)

//update info
router.put('/blogs/:id',validate({
    body: {
        tagIds: {
            type: 'array',
            required: false,
            itemType: 'number',
            min: 1
        }
    }
}), jwtValidate, BlogController.putUpdateBlog)

//update SEO
router.put('/blogs/seo/:id', jwtValidate, BlogController.putUpdateSEOBlog)

//delete blog
router.delete('/blogs/:id', jwtValidate, BlogController.deleteBlog)
export default router;
