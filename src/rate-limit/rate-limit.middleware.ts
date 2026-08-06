import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { RateLimitRepository } from './rate-limit.repository'

const REQUEST_LIMIT = 5
const TIME_WINDOW_IN_SECONDS = 10

export class RateLimitMiddleware {
   constructor(protected rateLimitRepository: RateLimitRepository) {}

   async checkRateLimit(req: Request, res: Response, next: NextFunction) {
      const ip = req.ip ?? 'Unknown IP'
      const url = req.originalUrl
      const currentDate = new Date()

      await this.rateLimitRepository.addRequest({
         ip,
         url,
         date: currentDate,
      })

      const fromDate = new Date(currentDate.getTime() - TIME_WINDOW_IN_SECONDS * 1000)

      const requestsCount = await this.rateLimitRepository.countRequests(ip, url, fromDate)

      if (requestsCount > REQUEST_LIMIT) {
         res.sendStatus(HTTP_STATUSES.TooManyRequests_429)
         return
      }

      next()
   }
}
