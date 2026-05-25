import { Router } from 'express'
import { postsController } from './posts.controller'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   commentFieldsValidator,
   idParamValidator,
   postFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { NextFunction, Request, Response } from 'express'

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts)

postsRouter.post(
   '/:postId/comments',
   (req: Request, res: Response, next: NextFunction) => {
      console.log('POST /posts/:postId/comments ROUTE WAS CALLED')
      console.log('POST_ID:', req.params.postId)
      next()
   },
   jwtAccessAuthMiddleware,
   commentFieldsValidator,
   errorsResultMiddleware,
   postsController.createCommentByPostId,
)

postsRouter.get('/:postId/comments', postsController.getCommentsByPostId)

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
