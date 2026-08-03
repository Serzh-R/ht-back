import jwt from 'jsonwebtoken'
import { ACCESS_SECRET, ACCESS_TIME, REFRESH_SECRET, REFRESH_TIME } from '../../core/settings'

export const jwtService = {
   async createAccessToken(userId: string): Promise<string> {
      const token = jwt.sign({ userId }, ACCESS_SECRET, {
         expiresIn: Number(ACCESS_TIME),
      })
      return token
   },

   async createRefreshToken(userId: string, deviceId: string): Promise<string> {
      const token = jwt.sign({ userId, deviceId }, REFRESH_SECRET, {
         expiresIn: Number(REFRESH_TIME),
      })

      return token
   },

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
   },

   async getUserIdByRefreshToken(refreshToken: string): Promise<string | null> {
      try {
         const result = jwt.verify(refreshToken, REFRESH_SECRET)

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
   },

   /*async decodeToken(token: string): Promise<any> {
     try {
        return jwt.decode(token)
     } catch (e: unknown) {
        console.error("Can't decode token", e)
        return null
     }
  },*/

   /*async verifyAccessToken(accessToken: string): Promise<{ userId: string } | null> {
      try {
         return jwt.verify(accessToken, ACCESS_SECRET) as { userId: string }
      } catch (error) {
         console.error('AccessToken verify some error')
         return null
      }
   },*/
}
