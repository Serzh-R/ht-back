import { Request, Response, Router } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import {
   apiRequestCollection,
   blogCollection,
   commentCollection,
   deviceSessionCollection,
   postCollection,
   userCollection,
} from '../db/mongo.db'

export const testingRouter = Router({})

testingRouter.delete('/', async (req: Request, res: Response) => {
   await blogCollection.deleteMany({})
   await postCollection.deleteMany({})
   await userCollection.deleteMany({})
   await commentCollection.deleteMany({})
   await deviceSessionCollection.deleteMany({})
   await apiRequestCollection.deleteMany({})

   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
