import { apiRequestCollection } from '../db/mongo.db'
import { ApiRequestDb } from './rate-limit.types'

export const rateLimitRepository = {
   async addRequest(request: ApiRequestDb): Promise<void> {
      await apiRequestCollection.insertOne(request)
   },

   async countRequests(ip: string, url: string, fromDate: Date): Promise<number> {
      return apiRequestCollection.countDocuments({
         ip,
         url,
         date: {
            $gte: fromDate,
         },
      })
   },
}
