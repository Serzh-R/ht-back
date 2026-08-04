import { Result, ResultStatus } from '../core/result/result.types'
import { securityRepository } from './security.repository'

export const securityService = {
   async deleteOtherSessions(userId: string, currentDeviceId: string): Promise<Result> {
      await securityRepository.deleteOtherSessions(userId, currentDeviceId)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },

   async deleteSessionByDeviceId(deviceId: string, userId: string): Promise<Result> {
      const session = await securityRepository.findSessionByDeviceId(deviceId)

      if (!session) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      if (session.userId !== userId) {
         return {
            status: ResultStatus.Forbidden,
            extensions: [],
            data: null,
         }
      }

      const isDeleted = await securityRepository.deleteSession(deviceId)

      if (!isDeleted) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },
}
