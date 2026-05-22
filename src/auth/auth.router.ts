import { Router } from 'express'
import { authController } from './auth.controller'
import { loginFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'

export const authRouter = Router({})

authRouter.post('/login', loginFieldsValidator, errorsResultMiddleware, authController.login)

authRouter.get('/me', jwtAccessAuthMiddleware, authController.me)
