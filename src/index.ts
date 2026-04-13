import express from 'express'

// создание приложения
const app = express()

// порт приложения
const PORT = process.env.PORT || 5001

// запуск приложения
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
