import { HydratedDocument, model, Schema } from 'mongoose'
import { DeviceSessionDb } from './security.types'

const deviceSessionSchema = new Schema<DeviceSessionDb>(
   {
      userId: { type: String, required: true },
      deviceId: { type: String, required: true },
      ip: { type: String, required: true },
      title: { type: String, required: true },
      lastActiveDate: { type: Date, required: true },
      expirationDate: { type: Date, required: true },
   },
   {
      collection: 'device-sessions',
      versionKey: false,
   },
)

deviceSessionSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 })

export type DeviceSessionDocument = HydratedDocument<DeviceSessionDb>

export const DeviceSessionModel = model<DeviceSessionDb>('DeviceSession', deviceSessionSchema)
