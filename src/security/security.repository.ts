import { deviceSessionCollection } from '../db/mongo.db'
import { DeviceSessionDb } from './security.types'
import { injectable } from 'inversify'

@injectable()
export class SecurityRepository {
   async createSession(session: DeviceSessionDb): Promise<void> {
      await deviceSessionCollection.insertOne(session)
   }

   async findSessionByDeviceId(deviceId: string): Promise<DeviceSessionDb | null> {
      return deviceSessionCollection.findOne({
         deviceId,
      })
   }

   async updateSession(
      deviceId: string,
      lastActiveDate: Date,
      expirationDate: Date,
   ): Promise<boolean> {
      const result = await deviceSessionCollection.updateOne(
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
      const result = await deviceSessionCollection.deleteOne({
         deviceId,
      })

      return result.deletedCount === 1
   }

   async deleteOtherSessions(userId: string, currentDeviceId: string): Promise<void> {
      await deviceSessionCollection.deleteMany({
         userId,
         deviceId: {
            $ne: currentDeviceId,
         },
      })
   }
}
