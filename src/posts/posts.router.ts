import { Router } from 'express'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   commentFieldsValidator,
   idParamValidator,
   postFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { PostsController } from './posts.controller'
import { container } from '../composition-root'
import { jwtAccessAuthOptionalMiddleware } from '../auth/middlewares/jwt-access-auth-optional.middleware'

const postsController = container.get(PostsController)

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts.bind(postsController))

postsRouter.post(
   '/:postId/comments',
   jwtAccessAuthMiddleware,
   commentFieldsValidator,
   errorsResultMiddleware,
   postsController.createCommentByPostId.bind(postsController),
)

postsRouter.get(
   '/:postId/comments',
   jwtAccessAuthOptionalMiddleware,
   postsController.getCommentsByPostId.bind(postsController),
)

postsRouter.get(
   '/:id',
   idParamValidator,
   errorsResultMiddleware,
   postsController.getPostById.bind(postsController),
)

postsRouter.post(
   '/',
   authMiddleware,
   postFieldsValidator,
   errorsResultMiddleware,
   postsController.createPost.bind(postsController),
)

postsRouter.put(
   '/:id',
   authMiddleware,
   idParamValidator,
   postFieldsValidator,
   errorsResultMiddleware,
   postsController.updatePost.bind(postsController),
)

postsRouter.delete(
   '/:id',
   authMiddleware,
   idParamValidator,
   errorsResultMiddleware,
   postsController.deletePost.bind(postsController),
)
