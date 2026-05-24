import { Router } from 'express'
import { commentsController } from './comments.controller'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { commentFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsController.getCommentById)

commentsRouter.put(
   '/:commentId',
   jwtAccessAuthMiddleware,
   commentFieldsValidator,
   errorsResultMiddleware,
   commentsController.updateComment,
)

commentsRouter.delete('/:commentId', jwtAccessAuthMiddleware, commentsController.deleteComment)
