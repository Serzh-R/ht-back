/*import { blacklistRefreshTokenCollection } from '../db/mongo.db'

export const refreshTokenBlacklistRepository = {
   async addToBlacklist(token: string): Promise<void> {
      await blacklistRefreshTokenCollection.insertOne({
         token,
         createdAt: new Date(),
      })
   },

   async isTokenBlacklist(token: string): Promise<boolean> {
      const blacklistToken = await blacklistRefreshTokenCollection.findOne({
         token,
      })

      return !!blacklistToken
   },
}*/
