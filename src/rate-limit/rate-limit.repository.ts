import { apiRequestCollection } from '../db/mongo.db'
import { ApiRequestDb } from './rate-limit.types'
import { injectable } from 'inversify'

@injectable()
export class RateLimitRepository {
   async addRequest(request: ApiRequestDb): Promise<void> {
      await apiRequestCollection.insertOne(request)
   }

   async countRequests(ip: string, url: string, fromDate: Date): Promise<number> {
      return apiRequestCollection.countDocuments({
         ip,
         url,
         date: {
            $gte: fromDate,
         },
      })
   }
}
