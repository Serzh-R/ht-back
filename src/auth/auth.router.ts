import { Router } from 'express'
import { authController } from './auth.controller'
import { loginFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'

export const authRouter = Router({})

authRouter.post('/login', loginFieldsValidator, errorsResultMiddleware, authController.login)
