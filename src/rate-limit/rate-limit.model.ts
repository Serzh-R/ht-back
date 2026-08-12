import { HydratedDocument, model, Schema } from 'mongoose'
import { ApiRequestDb } from './rate-limit.types'

const apiRequestSchema = new Schema<ApiRequestDb>(
   {
      ip: { type: String, required: true },
      url: { type: String, required: true },
      date: { type: Date, required: true },
   },
   {
      collection: 'api-requests',
      versionKey: false,
   },
)

apiRequestSchema.index({ date: 1 }, { expireAfterSeconds: 10 })

export type ApiRequestDocument = HydratedDocument<ApiRequestDb>

export const ApiRequestModel = model<ApiRequestDb>('ApiRequest', apiRequestSchema)
