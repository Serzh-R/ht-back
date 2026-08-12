import { Request, Response, Router } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { apiRequestCollection, deviceSessionCollection } from '../db/mongo.db'
import { BlogModel } from '../blogs/blogs.model'
import { PostModel } from '../posts/posts.model'
import { UserModel } from '../users/users.model'
import { CommentModel } from '../comments/comments.model'

export const testingRouter = Router({})

testingRouter.delete('/', async (req: Request, res: Response) => {
   await BlogModel.deleteMany({})
   await PostModel.deleteMany({})
   await UserModel.deleteMany({})
   await CommentModel.deleteMany({})
   await deviceSessionCollection.deleteMany({})
   await apiRequestCollection.deleteMany({})

   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
