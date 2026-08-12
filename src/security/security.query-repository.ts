import { DeviceViewModel } from './security.types'
import { mapperDeviceView } from './mappers/mapper-device.view'
import { injectable } from 'inversify'
import { DeviceSessionModel } from './security.model'

@injectable()
export class SecurityQueryRepository {
   async findAllByUserId(userId: string): Promise<DeviceViewModel[]> {
      const sessions = await DeviceSessionModel.find({
         userId,
      })

      return sessions.map(mapperDeviceView)
   }
}
