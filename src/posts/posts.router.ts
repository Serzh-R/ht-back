import { Router } from 'express'
import { postsController } from './posts.controller'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
  idParamValidator,
  postFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts)

postsRouter.get('/:id', idParamValidator, errorsResultMiddleware, postsController.getPostById)

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
  idParamValidator,
  postFieldsValidator,
  errorsResultMiddleware,
  postsController.updatePost,
)

postsRouter.delete(
  '/:id',
  authMiddleware,
  idParamValidator,
  errorsResultMiddleware,
  postsController.deletePost,
)
