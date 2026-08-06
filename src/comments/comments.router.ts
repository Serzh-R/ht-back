import { Router } from 'express'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { commentFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { CommentsRepository } from './comments.repository'
import { CommentsQueryRepository } from './comments.query-repository'
import { PostsQueryRepository } from '../posts/posts.query-repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'

const commentsRepository = new CommentsRepository()
const commentsQueryRepository = new CommentsQueryRepository()
const postsQueryRepository = new PostsQueryRepository()
const usersRepository = new UsersRepository()

const commentsService = new CommentsService(
   commentsRepository,
   postsQueryRepository,
   usersRepository,
)

const commentsController = new CommentsController(commentsService, commentsQueryRepository)

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
