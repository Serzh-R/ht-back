import { Router } from 'express'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   idParamValidator,
   userFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { UsersController } from './users.controller'
import { container } from '../composition-root'

const usersController = container.get(UsersController)

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
