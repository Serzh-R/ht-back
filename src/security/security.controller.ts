import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { ResultStatus } from '../core/result/result.types'
import { DeviceViewModel } from './security.types'
import { securityQueryRepository } from './security.query-repository'
import { securityService } from './security.service'

export const securityController = {
   async getDevices(req: Request, res: Response<DeviceViewModel[]>) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const devices = await securityQueryRepository.findAllByUserId(req.userId)

      res.status(HTTP_STATUSES.OK_200).send(devices)
   },

   async deleteOtherDevices(req: Request, res: Response) {
      if (!req.userId || !req.deviceId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      await securityService.deleteOtherSessions(req.userId, req.deviceId)

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async deleteDeviceById(req: Request<{ deviceId: string }>, res: Response) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const result = await securityService.deleteSessionByDeviceId(req.params.deviceId, req.userId)

      if (result.status === ResultStatus.NotFound) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      if (result.status === ResultStatus.Forbidden) {
         res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },
}
