import { Router } from 'express'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   commentFieldsValidator,
   idParamValidator,
   postFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from '../auth/middlewares/jwt-access-auth.middleware'
import { BlogsRepository } from '../blogs/blogs.repository'
import { PostsRepository } from './posts.repository'
import { PostsQueryRepository } from './posts.query-repository'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { CommentsRepository } from '../comments/comments.repository'
import { CommentsQueryRepository } from '../comments/comments.query-repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsService } from '../comments/comments.service'

const blogsRepository = new BlogsRepository()

const postsRepository = new PostsRepository()
const postsQueryRepository = new PostsQueryRepository()

const commentsRepository = new CommentsRepository()
const commentsQueryRepository = new CommentsQueryRepository()

const usersRepository = new UsersRepository()

const postsService = new PostsService(blogsRepository, postsRepository)

const commentsService = new CommentsService(
   commentsRepository,
   postsQueryRepository,
   usersRepository,
)

const postsController = new PostsController(
   postsService,
   postsQueryRepository,
   commentsService,
   commentsQueryRepository,
)

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts.bind(postsController))

postsRouter.post(
   '/:postId/comments',
   jwtAccessAuthMiddleware,
   commentFieldsValidator,
   errorsResultMiddleware,
   postsController.createCommentByPostId.bind(postsController),
)

postsRouter.get('/:postId/comments', postsController.getCommentsByPostId.bind(postsController))

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
