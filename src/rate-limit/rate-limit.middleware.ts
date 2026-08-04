import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { rateLimitRepository } from './rate-limit.repository'

const REQUEST_LIMIT = 5
const TIME_WINDOW_IN_SECONDS = 10

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   const ip = req.ip ?? 'Unknown IP'
   const url = req.originalUrl
   const currentDate = new Date()

   await rateLimitRepository.addRequest({
      ip,
      url,
      date: currentDate,
   })

   const fromDate = new Date(currentDate.getTime() - TIME_WINDOW_IN_SECONDS * 1000)

   const requestsCount = await rateLimitRepository.countRequests(ip, url, fromDate)

   if (requestsCount > REQUEST_LIMIT) {
      res.sendStatus(HTTP_STATUSES.TooManyRequests_429)
      return
   }

   next()
}
