import { Request, Response } from 'express'
import { HTTP_STATUSES, REFRESH_TIME } from '../core/settings'
import { ResultStatus } from '../core/result/result.types'
import { LoginInputModel, LoginSuccessViewModel, MeViewModel } from './auth.types'
import { authService } from './auth.service'
import { jwtService } from './adapters/jwt.service'
import { usersRepository } from '../users/users.repository'
import { mapperMeView } from './mappers/mapper-me.view'
import { RegConfirmCode, RegEmailResending } from './auth.types'
import { UserInput } from '../users/users.types'
import { resultCodeToHttpException } from '../core/result/result-code-to-http-exception'
import { refreshTokenBlacklistRepository } from './refresh-token-blacklist.repository'
import { randomUUID } from 'crypto'
import { securityRepository } from '../security/security.repository'

export const authController = {
   async login(req: Request<{}, {}, LoginInputModel>, res: Response<LoginSuccessViewModel>) {
      const result = await authService.checkCredentials(req.body)

      if (result.status === ResultStatus.Unauthorized || !result.data || !result.data._id) {
         res.sendStatus(resultCodeToHttpException(result.status))
         return
      }

      const userId = result.data._id.toString()
      const deviceId = randomUUID()
      const ip = req.ip ?? 'Unknown IP'
      const title = req.get('user-agent') ?? 'Unknown device'

      const accessToken = await jwtService.createAccessToken(userId)
      const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

      const refreshTokenPayload = await jwtService.getRefreshTokenPayload(refreshToken)

      if (!refreshTokenPayload) {
         res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
         return
      }

      await securityRepository.createSession({
         userId,
         deviceId,
         ip,
         title,
         lastActiveDate: new Date(refreshTokenPayload.iat * 1000),
         expirationDate: new Date(refreshTokenPayload.exp * 1000),
      })

      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         maxAge: Number(REFRESH_TIME) * 1000,
      })

      res.status(resultCodeToHttpException(result.status)).send({
         accessToken,
      })
   },

   async refreshToken(req: Request, res: Response<LoginSuccessViewModel>) {
      const oldRefreshToken = req.cookies.refreshToken

      await refreshTokenBlacklistRepository.addToBlacklist(oldRefreshToken)

      const newAccessToken = await jwtService.createAccessToken(req.userId!)
      const newRefreshToken = await jwtService.createRefreshToken(req.userId!, req.deviceId!)

      res.cookie('refreshToken', newRefreshToken, {
         httpOnly: true,
         secure: true,
         maxAge: Number(REFRESH_TIME) * 1000,
      })

      res.status(HTTP_STATUSES.OK_200).send({
         accessToken: newAccessToken,
      })
   },

   async logout(req: Request, res: Response) {
      const refreshToken = req.cookies.refreshToken

      await refreshTokenBlacklistRepository.addToBlacklist(refreshToken)

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async registration(req: Request<{}, {}, UserInput>, res: Response) {
      const result = await authService.registration(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   },

   async registrationConfirmation(req: Request<{}, {}, RegConfirmCode>, res: Response) {
      const result = await authService.registrationConfirmation(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   },

   async registrationEmailResending(req: Request<{}, {}, RegEmailResending>, res: Response) {
      const result = await authService.registrationEmailResending(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
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
