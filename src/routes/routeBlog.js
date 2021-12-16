import Router from 'koa-router';
import BlogController from '../controllers/blogController'

const router = new Router();
//get info blog
router.get('/blogs/:id', BlogController.getBlogInfo)

//get all list blog
router.get('/blogs', BlogController.getListBlogs)

export default router;