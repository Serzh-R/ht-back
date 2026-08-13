import { NextFunction, Request, Response } from 'express'
import { JwtService } from '../adapters/jwt.service'
import { container } from '../../composition-root'

const jwtService = container.get(JwtService)

export const jwtAccessAuthOptionalMiddleware = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   const authHeader = req.headers.authorization

   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
   }

   const accessToken = authHeader.split(' ')[1]

   if (!accessToken) {
      next()
      return
   }

   const userId = await jwtService.getUserIdByAccessToken(accessToken)

   if (userId) {
      req.userId = userId
   }

   next()
}
