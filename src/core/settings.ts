import { config } from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
   PORT: Number(process.env.PORT) || 3003,
   MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
   DB_NAME: process.env.DB_NAME || 'blogger_platform',

   ADMIN: {
      LOGIN: process.env.ADMIN_USERNAME || 'admin',
      PASSWORD: process.env.ADMIN_PASSWORD || 'qwerty',
   },

   PATH: {
      BLOGS: '/blogs',
      POSTS: '/posts',
      AUTH: '/auth',
      USERS: '/users',
      DELETE_ALL: '/testing/all-data',
   },
}

export const HTTP_STATUSES = {
   OK_200: 200,
   CREATED_201: 201,
   NO_CONTENT_204: 204,

   BAD_REQUEST_400: 400,
   UNAUTHORIZED_401: 401,
   FORBIDDEN_403: 403,
   NOT_FOUND_404: 404,

   SERVER_ERROR_500: 500,
}
