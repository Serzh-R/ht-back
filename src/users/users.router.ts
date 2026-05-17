import { Router } from 'express'
import { usersController } from './users.controller'
import { authMiddleware } from '../auth/middlewares/auth.middleware'
import {
   idParamValidator,
   userFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'

export const usersRouter = Router({})

usersRouter.get('/', authMiddleware, usersController.getUsers)

usersRouter.post(
   '/',
   authMiddleware,
   userFieldsValidator,
   errorsResultMiddleware,
   usersController.createUser,
)

usersRouter.delete(
   '/:id',
   authMiddleware,
   idParamValidator,
   errorsResultMiddleware,
   usersController.deleteUser,
)
