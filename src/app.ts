import { Request, Response } from 'express'
import { HTTP_STATUSES, SETTINGS } from './core/settings'
import express from 'express'
import { blogsRouter } from './blogs/blogs.router'
import { postsRouter } from './posts/posts.router'
import { testingRouter } from './testing/testing.router'
import { authRouter } from './auth/auth.router'
import { usersRouter } from './users/users.router'

export const createApp = () => {
   const app = express()

   app.set('trust proxy', true) // ✅ Позволяет корректно получать `req.ip` за прокси

   app.use(express.json())

   app.use(SETTINGS.PATH.BLOGS, blogsRouter)
   app.use(SETTINGS.PATH.POSTS, postsRouter)
   app.use(SETTINGS.PATH.AUTH, authRouter)
   app.use(SETTINGS.PATH.USERS, usersRouter)

   app.use(SETTINGS.PATH.DELETE_ALL, testingRouter)

   app.get('/', (req: Request, res: Response) => {
      res.status(HTTP_STATUSES.OK_200).json('Ciao Back-end!')
   })

   return app
}
