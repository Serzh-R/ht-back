import { Request, Response } from 'express'

import { HTTP_STATUSES, SETTINGS } from './core/settings'
import { db } from './db/db'

import express from 'express'
import { blogsRouter } from './blogs/blogs.router'
import { postsRouter } from './posts/posts.router'
import {blogCollection, postCollection} from "./db/mongo.db";

export const app = express()

app.use(express.json())

app.use(SETTINGS.PATH.BLOGS, blogsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter)

app.delete(SETTINGS.PATH.DELETE_ALL, async (req: Request, res: Response) => {
  await blogCollection.deleteMany({})
  await postCollection.deleteMany({})

  db.blogs = []
  db.posts = []

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUSES.OK_200).json('Ciao Back-end!')
})
