import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES, SETTINGS } from '../../settings'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let data = `${SETTINGS.ADMIN.LOGIN}:${SETTINGS.ADMIN.PASSWORD}`

  let base64data = Buffer.from(data).toString('base64') // закодированная string под base64
  const validAuthValue = `Basic ${base64data}` // вся кодировка 'Basic SDGSNstnsdgn' (admin:qwerty)
  let authHeader = req.headers.authorization

  if (authHeader && authHeader === validAuthValue) {
    next()
  } else res.sendStatus(HTTP_STATUSES.UNAUTORIZED_401)
}
