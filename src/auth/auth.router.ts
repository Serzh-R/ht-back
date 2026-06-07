import { Router } from 'express'
import { authController } from './auth.controller'
import {
   loginFieldsValidator,
   regConfirmationValidator,
   regEmailResendingValidator,
   userFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'
import { jwtRefreshAuthMiddleware } from './middlewares/jwt-refresh-auth.middleware'

export const authRouter = Router({})

authRouter.post('/login', loginFieldsValidator, errorsResultMiddleware, authController.login)

authRouter.post('/refresh-token', jwtRefreshAuthMiddleware, authController.refreshToken)

authRouter.post('/logout', jwtRefreshAuthMiddleware, authController.logout)

authRouter.post(
   '/registration',
   userFieldsValidator,
   errorsResultMiddleware,
   authController.registration,
)

authRouter.post(
   '/registration-confirmation',
   regConfirmationValidator,
   errorsResultMiddleware,
   authController.registrationConfirmation,
)

authRouter.post(
   '/registration-email-resending',
   regEmailResendingValidator,
   errorsResultMiddleware,
   authController.registrationEmailResending,
)

authRouter.get('/me', jwtAccessAuthMiddleware, authController.me)
