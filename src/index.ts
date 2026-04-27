import { createApp } from './app'
import { SETTINGS } from './core/settings'
import { runDb } from './db/mongo.db'

const startApp = async () => {
  if (!SETTINGS.MONGO_URL) {
    throw new Error('MONGO_URL is not defined')
  }

  const app = createApp()

  const isConnected = await runDb(SETTINGS.MONGO_URL)

  if (!isConnected) {
    process.exit(1)
  }

  app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT)
  })
}

startApp()
