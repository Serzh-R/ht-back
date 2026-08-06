import { Router } from 'express'
import {
   loginFieldsValidator,
   regConfirmationValidator,
   regEmailResendingValidator,
   userFieldsValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'
import { jwtRefreshAuthMiddleware } from './middlewares/jwt-refresh-auth.middleware'
import { rateLimitMiddleware } from '../rate-limit/rate-limit.middleware'
import { AuthController } from './auth.controller'
import { UsersRepository } from '../users/users.repository'
import { AuthService } from './auth.service'

const usersRepository = new UsersRepository()
const authService = new AuthService(usersRepository)

const authController = new AuthController(usersRepository, authService)

export const authRouter = Router({})

authRouter.post(
   '/login',
   rateLimitMiddleware,
   loginFieldsValidator,
   errorsResultMiddleware,
   authController.login.bind(authController),
)

authRouter.post(
   '/refresh-token',
   jwtRefreshAuthMiddleware,
   authController.refreshToken.bind(authController),
)

authRouter.post('/logout', jwtRefreshAuthMiddleware, authController.logout.bind(authController))

authRouter.post(
   '/registration',
   rateLimitMiddleware,
   userFieldsValidator,
   errorsResultMiddleware,
   authController.registration.bind(authController),
)

authRouter.post(
   '/registration-confirmation',
   rateLimitMiddleware,
   regConfirmationValidator,
   errorsResultMiddleware,
   authController.registrationConfirmation.bind(authController),
)

authRouter.post(
   '/registration-email-resending',
   rateLimitMiddleware,
   regEmailResendingValidator,
   errorsResultMiddleware,
   authController.registrationEmailResending.bind(authController),
)

authRouter.get('/me', jwtAccessAuthMiddleware, authController.me.bind(authController))
