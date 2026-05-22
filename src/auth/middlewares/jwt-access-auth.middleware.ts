import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES } from '../../core/settings'
import { jwtService } from '../adapters/jwt.service'

export const jwtAccessAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const authHeader = req.headers.authorization
      console.log('AUTH HEADER:', authHeader)

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const accessToken = authHeader.split(' ')[1]
      console.log('ACCESS TOKEN:', accessToken)

      if (!accessToken) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const userId = await jwtService.getUserIdByAccessToken(accessToken)
      console.log('USER ID FROM TOKEN:', userId)

      if (!userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      req.userId = userId

      next()
   } catch (error) {
      console.error('JWT Auth Middleware Error:', error)

      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
   }
}
