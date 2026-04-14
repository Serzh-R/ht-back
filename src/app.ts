import { Request, Response } from 'express'

import { HTTP_STATUSES, SETTINGS } from './settings'
import { db } from './db/db'

import express from 'express'
import {blogsRouter} from "./blogs/blogs.router";

export const app = express()

app.use(express.json())

app.use(SETTINGS.PATH.BLOGS, blogsRouter)

app.delete(SETTINGS.PATH.DELETE_ALL, (req: Request, res: Response) => {
  db.blogs = []
  db.posts = []

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUSES.OK_200).json('Ciao Back-end!')
})
