import { Request, Response, Router } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { blogCollection, postCollection } from '../db/mongo.db'

export const testingRouter = Router({})

testingRouter.delete('/', async (req: Request, res: Response) => {
   await blogCollection.deleteMany({})
   await postCollection.deleteMany({})

   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
