import { deviceSessionCollection } from '../db/mongo.db'
import { DeviceSessionDb } from './security.types'

export const securityRepository = {
   async createSession(session: DeviceSessionDb): Promise<void> {
      await deviceSessionCollection.insertOne(session)
   },

   async findSessionByDeviceId(deviceId: string): Promise<DeviceSessionDb | null> {
      return deviceSessionCollection.findOne({
         deviceId,
      })
   },

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
   },
}
