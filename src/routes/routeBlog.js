import Router from 'koa-router';
import BlogController from '../controllers/blogController'
import {
    jwtValidate
} from '../middlewares';
const router = new Router();
//get info blog
router.get('/blogs/:id', jwtValidate, BlogController.getBlogInfo)

//get all list blog
router.get('/blogs', jwtValidate, BlogController.getListBlogs)

// create blog
router.post('/blogs', jwtValidate, BlogController.postCreateNewBlog)

//update info
router.put('/blogs/:id', jwtValidate, BlogController.putUpdateBlog)

//update SEO
router.put('/blogs/seo/:id', jwtValidate, BlogController.putUpdateSEOBlog)

//delete blog
router.delete('/blogs/:id', jwtValidate, BlogController.deleteBlog)
export default router;