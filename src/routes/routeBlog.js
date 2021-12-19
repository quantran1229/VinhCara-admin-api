import Router from 'koa-router';
import BlogController from '../controllers/blogController'
import {
    jwtValidate
} from '../middlewares';
const router = new Router();
//get info blog
router.get('/blogs/:id', BlogController.getBlogInfo)

//get all list blog
router.get('/blogs', BlogController.getListBlogs)

// create blog
router.post('/blogs', jwtValidate, BlogController.postCreateNewBlog)

//update
router.put('/blogs/:id', jwtValidate, BlogController.putUpdateBlog)

export default router;