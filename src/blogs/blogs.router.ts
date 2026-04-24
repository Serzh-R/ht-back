import { Router } from 'express'
import { blogsController } from './blogs.controller'
import {
  blogFieldsValidator,
  idParamValidator,
} from '../core/middlewares/validation/fieldValidators'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'

export const blogsRouter = Router({})

blogsRouter.get('/', blogsController.getBlogs)

blogsRouter.post(
  '/',
  authMiddleware,
  blogFieldsValidator,
  errorsResultMiddleware,
  blogsController.createBlog,
)

blogsRouter.get('/:id', idParamValidator, errorsResultMiddleware, blogsController.getBlogById)

blogsRouter.put(
  '/:id',
  authMiddleware,
  idParamValidator,
  blogFieldsValidator,
  errorsResultMiddleware,
  blogsController.updateBlog,
)

blogsRouter.delete(
  '/:id',
  authMiddleware,
  idParamValidator,
  errorsResultMiddleware,
  blogsController.deleteBlogById,
)
