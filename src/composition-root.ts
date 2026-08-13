import 'reflect-metadata'

import { Container } from 'inversify'

import { UsersRepository } from './users/users.repository'
import { UsersQueryRepository } from './users/users.query-repository'
import { UsersService } from './users/users.service'
import { UsersController } from './users/users.controller'

import { AuthService } from './auth/auth.service'
import { AuthController } from './auth/auth.controller'

import { BlogsRepository } from './blogs/blogs.repository'
import { BlogsQueryRepository } from './blogs/blogs.query-repository'
import { BlogsService } from './blogs/blogs.service'
import { BlogsController } from './blogs/blogs.controller'

import { PostsRepository } from './posts/posts.repository'
import { PostsQueryRepository } from './posts/posts.query-repository'
import { PostsService } from './posts/posts.service'
import { PostsController } from './posts/posts.controller'

import { CommentsRepository } from './comments/comments.repository'
import { CommentsQueryRepository } from './comments/comments.query-repository'
import { CommentsService } from './comments/comments.service'
import { CommentsController } from './comments/comments.controller'

import { SecurityRepository } from './security/security.repository'
import { SecurityQueryRepository } from './security/security.query-repository'
import { SecurityService } from './security/security.service'
import { SecurityController } from './security/security.controller'

import { BcryptService } from './auth/adapters/bcrypt.service'
import { JwtService } from './auth/adapters/jwt.service'

import { EmailAdapter } from './email/email.adapter'
import { EmailManager } from './email/email.manager'

import { RateLimitRepository } from './rate-limit/rate-limit.repository'
import { RateLimitMiddleware } from './rate-limit/rate-limit.middleware'

import { LikesRepository } from './likes/likes.repository'
import { LikesService } from './likes/likes.service'
import { LikesQueryRepository } from './likes/likes.query-repository'

export const container = new Container()

container.bind(UsersRepository).toSelf()
container.bind(UsersQueryRepository).toSelf()
container.bind(UsersService).toSelf()
container.bind(UsersController).toSelf()

container.bind(AuthService).toSelf()
container.bind(AuthController).toSelf()

container.bind(BlogsRepository).toSelf()
container.bind(BlogsQueryRepository).toSelf()
container.bind(BlogsService).toSelf()
container.bind(BlogsController).toSelf()

container.bind(PostsRepository).toSelf()
container.bind(PostsQueryRepository).toSelf()
container.bind(PostsService).toSelf()
container.bind(PostsController).toSelf()

container.bind(CommentsRepository).toSelf()
container.bind(CommentsQueryRepository).toSelf()
container.bind(CommentsService).toSelf()
container.bind(CommentsController).toSelf()

container.bind(SecurityRepository).toSelf()
container.bind(SecurityQueryRepository).toSelf()
container.bind(SecurityService).toSelf()
container.bind(SecurityController).toSelf()

container.bind(BcryptService).toSelf()
container.bind(JwtService).toSelf()

container.bind(EmailAdapter).toSelf()
container.bind(EmailManager).toSelf()

container.bind(RateLimitRepository).toSelf()
container.bind(RateLimitMiddleware).toSelf()

container.bind(LikesRepository).toSelf()
container.bind(LikesQueryRepository).toSelf()
container.bind(LikesService).toSelf()
