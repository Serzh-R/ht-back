import { Router } from 'express'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import {
   commentFieldsValidator,
   likeStatusValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { CommentsController } from './comments.controller'
import { container } from '../composition-root'
import { jwtAccessAuthOptionalMiddleware } from '../auth/middlewares/jwt-access-auth-optional.middleware'

const commentsController = container.get(CommentsController)

export const commentsRouter = Router()

commentsRouter.put(
   '/:commentId/like-status',
   jwtAccessAuthMiddleware,
   likeStatusValidator,
   errorsResultMiddleware,
   commentsController.updateLikeStatus.bind(commentsController),
)

commentsRouter.get(
   '/:id',
   jwtAccessAuthOptionalMiddleware,
   commentsController.getCommentById.bind(commentsController),
)

commentsRouter.put(
   '/:commentId',
   jwtAccessAuthMiddleware,
   commentFieldsValidator,
   errorsResultMiddleware,
   commentsController.updateComment.bind(commentsController),
)

commentsRouter.delete(
   '/:commentId',
   jwtAccessAuthMiddleware,
   commentsController.deleteComment.bind(commentsController),
)
