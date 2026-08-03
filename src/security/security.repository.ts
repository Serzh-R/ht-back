import { DeviceSessionDb } from './security.types'
import { deviceSessionCollection } from '../db/mongo.db'

export const securityRepository = {
   async createSession(session: DeviceSessionDb): Promise<void> {
      await deviceSessionCollection.insertOne(session)
   },
}
