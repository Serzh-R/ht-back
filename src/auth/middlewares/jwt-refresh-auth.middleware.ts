import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES } from '../../core/settings'
import { JwtService } from '../adapters/jwt.service'
import { UsersRepository } from '../../users/users.repository'
import { SecurityRepository } from '../../security/security.repository'

const jwtService = new JwtService()
const usersRepository = new UsersRepository()
const securityRepository = new SecurityRepository()

export const jwtRefreshAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   const refreshToken = req.cookies.refreshToken

   if (!refreshToken) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   const refreshTokenPayload = await jwtService.getRefreshTokenPayload(refreshToken)

   if (!refreshTokenPayload) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   const session = await securityRepository.findSessionByDeviceId(refreshTokenPayload.deviceId)

   if (!session) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   if (session.userId !== refreshTokenPayload.userId) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   if (session.lastActiveDate.getTime() !== refreshTokenPayload.iat * 1000) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   const user = await usersRepository.findById(refreshTokenPayload.userId)

   if (!user) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   req.userId = refreshTokenPayload.userId
   req.deviceId = refreshTokenPayload.deviceId

   next()
}
