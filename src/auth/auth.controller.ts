import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { ResultStatus } from '../core/result/result.types'
import { LoginInputModel, LoginSuccessViewModel, MeViewModel } from './auth.types'
import { authService } from './auth.service'
import { jwtService } from './adapters/jwt.service'
import { usersRepository } from '../users/users.repository'
import { mapperMeView } from './mappers/mapper-me.view'
import { RegConfirmCode, RegEmailResending } from './auth.types'

export const authController = {
   async login(req: Request<{}, {}, LoginInputModel>, res: Response<LoginSuccessViewModel>) {
      const result = await authService.checkCredentials(req.body)

      if (result.status === ResultStatus.Unauthorized || !result.data || !result.data._id) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const accessToken = await jwtService.createAccessToken(result.data._id.toString())

      res.status(HTTP_STATUSES.OK_200).send({
         accessToken,
      })
   },

   async registration(req: Request, res: Response) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async registrationConfirmation(req: Request<{}, {}, RegConfirmCode>, res: Response) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async registrationEmailResending(req: Request<{}, {}, RegEmailResending>, res: Response) {
      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async me(req: Request, res: Response<MeViewModel>) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const user = await usersRepository.findById(req.userId)

      if (!user) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      res.status(HTTP_STATUSES.OK_200).send(mapperMeView(user))
   },
}
