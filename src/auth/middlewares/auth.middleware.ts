import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES, SETTINGS } from '../../core/settings'

const ADMIN_USERNAME = SETTINGS.ADMIN.LOGIN
const ADMIN_PASSWORD = SETTINGS.ADMIN.PASSWORD

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
   const auth = req.headers.authorization

   if (!auth) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   const [authType, token] = auth.split(' ')

   if (authType !== 'Basic') {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   if (!token) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   const credentials = Buffer.from(token, 'base64').toString('utf-8')

   const [username, password] = credentials.split(':') // credentials: 'admin:qwerty'

   if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
   }

   next() // Успешная авторизация, продолжаем
}
