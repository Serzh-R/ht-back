import { Router } from 'express'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { commentFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { CommentsController } from './comments.controller'
import { container } from '../composition-root'

const commentsController = container.get(CommentsController)

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController))

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
