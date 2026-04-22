
import { SETTINGS } from '../settings'
import mongoose from 'mongoose'

export async function runDb(url: string): Promise<boolean> {
    try {
        await mongoose.connect(url, {
            dbName: SETTINGS.DB_NAME,
        })

        console.log('Connected successfully to MongoDB')
        return true
    } catch (err) {
        console.error('Error connecting to MongoDB:', err)
        return false
    }
}