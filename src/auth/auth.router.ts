import { Router } from 'express'
import { authController } from './auth.controller'
import { loginFieldsValidator } from '../core/middlewares/validation/fieldValidators'
import { errorsResultMiddleware } from '../core/middlewares/validation/errorsResultMiddleware'
import { jwtAccessAuthMiddleware } from './middlewares/jwt-access-auth.middleware'

export const authRouter = Router({})

authRouter.post('/login', loginFieldsValidator, errorsResultMiddleware, authController.login)

/*authRouter.get('/me', jwtAccessAuthMiddleware, authController.me)*/

authRouter.get(
   '/me',
   (req, res, next) => {
      console.log('ROUTE /auth/me WAS CALLED')
      next()
   },
   jwtAccessAuthMiddleware,
   authController.me,
)
