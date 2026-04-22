import { app } from './app'
import { SETTINGS } from './settings'
import {runDb} from "./db/mongo.db";

app.set('trust proxy', true) // ✅ Позволяет корректно получать `req.ip` за прокси

const startApp = async () => {
  const isConnected = await runDb(SETTINGS.MONGO_URL)

  if (!isConnected) {
    process.exit(1)
  }

  app.listen(SETTINGS.PORT, () => {
    console.log('...server started in port ' + SETTINGS.PORT)
  })
}

startApp()
