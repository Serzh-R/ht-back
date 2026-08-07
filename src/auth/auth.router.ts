import { Router } from 'express'
import {
   loginFieldsValidator,
   regConfirmationValidator,
   regEmailResendingValidator,
   userFieldsValidator,
   newPasswordValidator,
   passwordRecoveryValidator,
} from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'
import { jwtRefreshAuthMiddleware } from './middlewares/jwt-refresh-auth.middleware'
import { AuthController } from './auth.controller'
import { RateLimitMiddleware } from '../rate-limit/rate-limit.middleware'
import { container } from '../composition-root'

const authController = container.get(AuthController)
const rateLimitMiddleware = container.get(RateLimitMiddleware)

export const authRouter = Router({})

authRouter.post(
   '/login',
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
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
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
   userFieldsValidator,
   errorsResultMiddleware,
   authController.registration.bind(authController),
)

authRouter.post(
   '/registration-confirmation',
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
   regConfirmationValidator,
   errorsResultMiddleware,
   authController.registrationConfirmation.bind(authController),
)

authRouter.post(
   '/registration-email-resending',
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
   regEmailResendingValidator,
   errorsResultMiddleware,
   authController.registrationEmailResending.bind(authController),
)

authRouter.post(
   '/password-recovery',
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
   passwordRecoveryValidator,
   errorsResultMiddleware,
   authController.passwordRecovery.bind(authController),
)

authRouter.post(
   '/new-password',
   rateLimitMiddleware.checkRateLimit.bind(rateLimitMiddleware),
   newPasswordValidator,
   errorsResultMiddleware,
   authController.newPassword.bind(authController),
)

authRouter.get('/me', jwtAccessAuthMiddleware, authController.me.bind(authController))
