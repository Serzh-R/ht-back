import { blacklistRefreshTokenCollection } from '../db/mongo.db'

export const refreshTokenBlacklistRepository = {
   async addToBlacklist(token: string): Promise<void> {
      await blacklistRefreshTokenCollection.insertOne({
         token,
         createdAt: new Date(),
      })
   },

   async isTokenBlacklisted(token: string): Promise<boolean> {
      const blacklistedToken = await blacklistRefreshTokenCollection.findOne({
         token,
      })

      return !!blacklistedToken
   },
}
