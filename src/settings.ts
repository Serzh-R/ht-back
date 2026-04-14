import { config } from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
  PORT: Number(process.env.PORT) || 3003,

  PATH: {
    BLOGS: '/blogs',
    POSTS: '/posts',
    DELETE_ALL: '/testing/all-data',
  },
}

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,

  SERVER_ERROR_500: 500,
}
