import { Request, Response } from 'express'
import { HTTP_STATUSES, REFRESH_TIME } from '../core/settings'
import { ResultStatus } from '../core/result/result.types'
import {
   LoginInputModel,
   LoginSuccessViewModel,
   MeViewModel,
   NewPasswordRecoveryInputModel,
   PasswordRecoveryInputModel,
} from './auth.types'
import { AuthService } from './auth.service'
import { UsersRepository } from '../users/users.repository'
import { mapperMeView } from './mappers/mapper-me.view'
import { RegConfirmCode, RegEmailResending } from './auth.types'
import { UserInput } from '../users/users.types'
import { resultCodeToHttpException } from '../core/result/result-code-to-http-exception'
import { randomUUID } from 'crypto'
import { SecurityRepository } from '../security/security.repository'
import { JwtService } from './adapters/jwt.service'
import { inject, injectable } from 'inversify'

@injectable()
export class AuthController {
   constructor(
      @inject(UsersRepository) private usersRepository: UsersRepository,
      @inject(AuthService) private authService: AuthService,
      @inject(SecurityRepository) private securityRepository: SecurityRepository,
      @inject(JwtService) private jwtService: JwtService,
   ) {}

   async login(req: Request<{}, {}, LoginInputModel>, res: Response<LoginSuccessViewModel>) {
      const result = await this.authService.checkCredentials(req.body)

      if (result.status === ResultStatus.Unauthorized || !result.data || !result.data._id) {
         res.sendStatus(resultCodeToHttpException(result.status))
         return
      }

      const userId = result.data._id.toString()
      const deviceId = randomUUID()
      const ip = req.ip ?? 'Unknown IP'
      const title = req.get('user-agent') ?? 'Unknown device'

      const accessToken = await this.jwtService.createAccessToken(userId)
      const refreshToken = await this.jwtService.createRefreshToken(userId, deviceId)

      const refreshTokenPayload = await this.jwtService.getRefreshTokenPayload(refreshToken)

      if (!refreshTokenPayload) {
         res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
         return
      }

      await this.securityRepository.createSession({
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
   }

   async refreshToken(req: Request, res: Response<LoginSuccessViewModel>) {
      if (!req.userId || !req.deviceId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const newAccessToken = await this.jwtService.createAccessToken(req.userId)
      const newRefreshToken = await this.jwtService.createRefreshToken(req.userId, req.deviceId)

      const newRefreshTokenPayload = await this.jwtService.getRefreshTokenPayload(newRefreshToken)

      if (!newRefreshTokenPayload) {
         res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
         return
      }

      const isSessionUpdated = await this.securityRepository.updateSession(
         req.deviceId,
         new Date(newRefreshTokenPayload.iat * 1000),
         new Date(newRefreshTokenPayload.exp * 1000),
      )

      if (!isSessionUpdated) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      res.cookie('refreshToken', newRefreshToken, {
         httpOnly: true,
         secure: true,
         maxAge: Number(REFRESH_TIME) * 1000,
      })

      res.status(HTTP_STATUSES.OK_200).send({
         accessToken: newAccessToken,
      })
   }

   async logout(req: Request, res: Response) {
      if (!req.deviceId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const isSessionDeleted = await this.securityRepository.deleteSession(req.deviceId)

      if (!isSessionDeleted) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      res.clearCookie('refreshToken', {
         httpOnly: true,
         secure: true,
      })

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   }

   async registration(req: Request<{}, {}, UserInput>, res: Response) {
      const result = await this.authService.registration(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   }

   async registrationConfirmation(req: Request<{}, {}, RegConfirmCode>, res: Response) {
      const result = await this.authService.registrationConfirmation(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   }

   async registrationEmailResending(req: Request<{}, {}, RegEmailResending>, res: Response) {
      const result = await this.authService.registrationEmailResending(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   }

   async passwordRecovery(req: Request<{}, {}, PasswordRecoveryInputModel>, res: Response) {
      const result = await this.authService.passwordRecovery(req.body)

      res.sendStatus(resultCodeToHttpException(result.status))
   }

   async newPassword(req: Request<{}, {}, NewPasswordRecoveryInputModel>, res: Response) {
      const result = await this.authService.newPassword(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(resultCodeToHttpException(result.status)).send({
            errorsMessages: result.extensions,
         })

         return
      }

      res.sendStatus(resultCodeToHttpException(result.status))
   }

   async me(req: Request, res: Response<MeViewModel>) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const user = await this.usersRepository.findById(req.userId)

      if (!user) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      res.status(HTTP_STATUSES.OK_200).send(mapperMeView(user))
   }
}
