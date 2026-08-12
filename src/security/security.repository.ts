import { DeviceSessionDb } from './security.types'
import { injectable } from 'inversify'
import { DeviceSessionDocument, DeviceSessionModel } from './security.model'

@injectable()
export class SecurityRepository {
   async createSession(session: DeviceSessionDb): Promise<void> {
      await DeviceSessionModel.create(session)
   }

   async findSessionByDeviceId(deviceId: string): Promise<DeviceSessionDocument | null> {
      return DeviceSessionModel.findOne({
         deviceId,
      })
   }

   async updateSession(
      deviceId: string,
      lastActiveDate: Date,
      expirationDate: Date,
   ): Promise<boolean> {
      const result = await DeviceSessionModel.updateOne(
         {
            deviceId,
         },
         {
            $set: {
               lastActiveDate,
               expirationDate,
            },
         },
      )

      return result.matchedCount === 1
   }

   async deleteSession(deviceId: string): Promise<boolean> {
      const result = await DeviceSessionModel.deleteOne({
         deviceId,
      })

      return result.deletedCount === 1
   }

   async deleteOtherSessions(userId: string, currentDeviceId: string): Promise<void> {
      await DeviceSessionModel.deleteMany({
         userId,
         deviceId: {
            $ne: currentDeviceId,
         },
      })
   }
}
