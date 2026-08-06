import { Router } from 'express'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   idParamValidator,
   userFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'
import { UsersQueryRepository } from './users.query-repository'
import { BcryptService } from '../auth/adapters/bcrypt.service'

const bcryptService = new BcryptService()
const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()

const usersService = new UsersService(usersRepository, bcryptService)

const usersController = new UsersController(usersService, usersQueryRepository)

export const usersRouter = Router({})

usersRouter.get('/', authMiddleware, usersController.getUsers.bind(usersController))

usersRouter.post(
   '/',
   authMiddleware,
   userFieldsValidator,
   errorsResultMiddleware,
   usersController.createUser.bind(usersController),
)

usersRouter.delete(
   '/:id',
   authMiddleware,
   idParamValidator,
   errorsResultMiddleware,
   usersController.deleteUser.bind(usersController),
)
