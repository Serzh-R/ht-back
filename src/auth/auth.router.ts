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
import { UsersRepository } from '../users/users.repository'
import { AuthService } from './auth.service'
import { SecurityRepository } from '../security/security.repository'
import { RateLimitRepository } from '../rate-limit/rate-limit.repository'
import { RateLimitMiddleware } from '../rate-limit/rate-limit.middleware'
import { BcryptService } from './adapters/bcrypt.service'
import { JwtService } from './adapters/jwt.service'
import { EmailAdapter } from '../email/email.adapter'
import { EmailManager } from '../email/email.manager'

const usersRepository = new UsersRepository()
const securityRepository = new SecurityRepository()
const rateLimitRepository = new RateLimitRepository()
const bcryptService = new BcryptService()
const jwtService = new JwtService()

const emailAdapter = new EmailAdapter()
const emailManager = new EmailManager(emailAdapter)

const rateLimitMiddleware = new RateLimitMiddleware(rateLimitRepository)
const authService = new AuthService(usersRepository, bcryptService, emailManager)

const authController = new AuthController(
   usersRepository,
   authService,
   securityRepository,
   jwtService,
)

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
