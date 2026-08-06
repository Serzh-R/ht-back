import { Router } from 'express'
import {
   blogFieldsValidator,
   blogIdParamValidator,
   blogPostFieldsValidator,
   idParamValidator,
} from '../core/middlewares/validation/fieldValidators'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { blogsController } from '../composition-root'

export const blogsRouter = Router({})

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))

blogsRouter.post(
   '/',
   authMiddleware,
   blogFieldsValidator,
   errorsResultMiddleware,
   blogsController.createBlog.bind(blogsController),
)

blogsRouter.get('/:blogId/posts', blogsController.getPostsByBlogId.bind(blogsController))

blogsRouter.post(
   '/:blogId/posts',
   authMiddleware,
   blogIdParamValidator,
   blogPostFieldsValidator,
   errorsResultMiddleware,
   blogsController.createPostByBlogId.bind(blogsController),
)

blogsRouter.get(
   '/:id',
   idParamValidator,
   errorsResultMiddleware,
   blogsController.getBlogById.bind(blogsController),
)

blogsRouter.put(
   '/:id',
   authMiddleware,
   idParamValidator,
   blogFieldsValidator,
   errorsResultMiddleware,
   blogsController.updateBlog.bind(blogsController),
)

blogsRouter.delete(
   '/:id',
   authMiddleware,
   idParamValidator,
   errorsResultMiddleware,
   blogsController.deleteBlogById.bind(blogsController),
)
