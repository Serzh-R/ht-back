import { Router } from 'express'
import { postsController } from './posts.controller'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
  postFieldsValidator,
  postIdParamValidator,
} from '../validation/express-validator/fieldValidators'
import { errorsResultMiddleware } from '../validation/express-validator/errorsResultMiddleware'

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts)

postsRouter.get('/:id', postIdParamValidator, errorsResultMiddleware, postsController.getPostById)

postsRouter.post(
  '/',
  authMiddleware,
  postFieldsValidator,
  errorsResultMiddleware,
  postsController.createPost,
)

postsRouter.put(
  '/:id',
  authMiddleware,
  postIdParamValidator,
  postFieldsValidator,
  errorsResultMiddleware,
  postsController.updatePost,
)

postsRouter.delete(
  '/:id',
  authMiddleware,
  postIdParamValidator,
  errorsResultMiddleware,
  postsController.deletePost,
)
