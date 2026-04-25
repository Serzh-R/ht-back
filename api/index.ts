import { app } from '../src/app'
import { SETTINGS } from '../src/core/settings'
import { runDb } from '../src/db/mongo.db'

let isConnected = false

export default async function handler(req: any, res: any) {
    if (!isConnected) {
        isConnected = await runDb(SETTINGS.MONGO_URL)
    }

    return app(req, res)
}