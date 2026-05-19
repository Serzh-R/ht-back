import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { ResultStatus } from '../core/types/result.types'
import { LoginInputModel } from './auth.types'
import { authService } from './auth.service'

export const authController = {
   async login(req: Request<{}, {}, LoginInputModel>, res: Response) {
      const result = await authService.checkCredentials(req.body)

      if (result.status === ResultStatus.Unauthorized) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },
}
