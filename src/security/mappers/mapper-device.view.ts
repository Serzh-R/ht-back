import { DeviceSessionDb, DeviceViewModel } from '../security.types'

export const mapperDeviceView = (session: DeviceSessionDb): DeviceViewModel => {
   return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate.toISOString(),
      deviceId: session.deviceId,
   }
}
