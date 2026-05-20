import jwt from 'jsonwebtoken'
import { ACCESS_SECRET, ACCESS_TIME } from '../../core/settings'

export const jwtService = {
   async createAccessToken(userId: string): Promise<string> {
      return jwt.sign({ userId }, ACCESS_SECRET, {
         expiresIn: Number(ACCESS_TIME),
      })
   },

   async decodeToken(token: string): Promise<any> {
      try {
         return jwt.decode(token)
      } catch (e: unknown) {
         console.error("Can't decode token", e)
         return null
      }
   },

   async verifyAccessToken(accessToken: string): Promise<{ userId: string } | null> {
      try {
         return jwt.verify(accessToken, ACCESS_SECRET) as { userId: string }
      } catch (error) {
         console.error('AccessToken verify some error')
         return null
      }
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
      } catch (error) {
         console.error('AccessToken verify some error')
         return null
      }
   },
}
