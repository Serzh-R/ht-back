import { ApiRequestDb } from './rate-limit.types'
import { injectable } from 'inversify'
import { ApiRequestModel } from './rate-limit.model'

@injectable()
export class RateLimitRepository {
   async addRequest(request: ApiRequestDb): Promise<void> {
      await ApiRequestModel.create(request)
   }

   async countRequests(ip: string, url: string, fromDate: Date): Promise<number> {
      return ApiRequestModel.countDocuments({
         ip,
         url,
         date: {
            $gte: fromDate,
         },
      })
   }
}
