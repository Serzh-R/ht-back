import jwt, { JwtPayload } from 'jsonwebtoken'
import { ACCESS_SECRET, ACCESS_TIME, REFRESH_SECRET, REFRESH_TIME } from '../../core/settings'

type RefreshTokenPayload = JwtPayload & {
   userId: string
   deviceId: string
   iat: number
   exp: number
}

export class JwtService {
   async createAccessToken(userId: string): Promise<string> {
      const token = jwt.sign({ userId }, ACCESS_SECRET, {
         expiresIn: Number(ACCESS_TIME),
      })
      return token
   }

   async createRefreshToken(userId: string, deviceId: string): Promise<string> {
      const token = jwt.sign({ userId, deviceId }, REFRESH_SECRET, {
         expiresIn: Number(REFRESH_TIME),
      })

      return token
   }

   async getUserIdByAccessToken(accessToken: string): Promise<string | null> {
      try {
         const result = jwt.verify(accessToken, ACCESS_SECRET)

         if (
            typeof result === 'object' &&
            result !== null &&
            'userId' in result &&
            typeof result.userId === 'string'
         ) {
            return result.userId
         }

         return null
      } catch {
         return null
      }
   }

   async getRefreshTokenPayload(refreshToken: string): Promise<RefreshTokenPayload | null> {
      try {
         const result = jwt.verify(refreshToken, REFRESH_SECRET)

         if (
            typeof result === 'object' &&
            result !== null &&
            'userId' in result &&
            typeof result.userId === 'string' &&
            'deviceId' in result &&
            typeof result.deviceId === 'string' &&
            typeof result.iat === 'number' &&
            typeof result.exp === 'number'
         ) {
            return result as RefreshTokenPayload
         }

         return null
      } catch {
         return null
      }
   }
}
