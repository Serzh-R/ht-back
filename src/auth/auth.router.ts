import { Router } from 'express'
import { authController } from './auth.controller'
import { loginFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'

export const authRouter = Router({})

authRouter.post('/login', loginFieldsValidator, errorsResultMiddleware, authController.login)

authRouter.post('/registration', authController.registration)

authRouter.post('/registration-confirmation', authController.registrationConfirmation)

authRouter.post('/registration-email-resending', authController.registrationEmailResending)

authRouter.get('/me', jwtAccessAuthMiddleware, authController.me)
