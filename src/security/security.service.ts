import { Result, ResultStatus } from '../core/result/result.types'
import { SecurityRepository } from './security.repository'
import { inject, injectable } from 'inversify'

@injectable()
export class SecurityService {
   constructor(@inject(SecurityRepository) private securityRepository: SecurityRepository) {}

   async deleteOtherSessions(userId: string, currentDeviceId: string): Promise<Result> {
      await this.securityRepository.deleteOtherSessions(userId, currentDeviceId)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }

   async deleteSessionByDeviceId(deviceId: string, userId: string): Promise<Result> {
      const session = await this.securityRepository.findSessionByDeviceId(deviceId)

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

      const isDeleted = await this.securityRepository.deleteSession(deviceId)

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
   }
}
