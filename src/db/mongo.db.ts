import mongoose from 'mongoose'
import { SETTINGS } from '../core/settings'

export async function runDb(url: string): Promise<boolean> {
   try {
      await mongoose.connect(url, {
         dbName: SETTINGS.DB_NAME,
      })

      const db = mongoose.connection.db

      if (!db) {
         throw new Error('Database connection is not initialized')
      }

      await db.command({ ping: 1 })

      console.log('✅ Connected to the database')
      return true
   } catch (e) {
      await mongoose.disconnect()

      console.error('❌ Database not connected:', e)
      return false
   }
}
// tests
export async function stopDb() {
   if (mongoose.connection.readyState === 0) {
      throw new Error('❌ No active connection')
   }

   await mongoose.disconnect()
}
