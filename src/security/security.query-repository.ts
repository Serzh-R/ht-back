import { deviceSessionCollection } from '../db/mongo.db'
import { DeviceViewModel } from './security.types'
import { mapperDeviceView } from './mappers/mapper-device.view'

export class SecurityQueryRepository {
   async findAllByUserId(userId: string): Promise<DeviceViewModel[]> {
      const sessions = await deviceSessionCollection
         .find({
            userId,
         })
         .toArray()

      return sessions.map(mapperDeviceView)
   }
}
