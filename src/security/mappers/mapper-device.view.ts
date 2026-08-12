import { DeviceViewModel } from '../security.types'
import { DeviceSessionDocument } from '../security.model'

export const mapperDeviceView = (session: DeviceSessionDocument): DeviceViewModel => {
   return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate.toISOString(),
      deviceId: session.deviceId,
   }
}
