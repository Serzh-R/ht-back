import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { ResultStatus } from '../core/result/result.types'
import { LoginInputModel, LoginSuccessViewModel } from './auth.types'
import { authService } from './auth.service'
import { jwtService } from './adapters/jwt.service'

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
}
