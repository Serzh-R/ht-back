import { ObjectId } from 'mongodb'

export type PostInput = {
  title: string
  shortDescription: string
  content: string
  blogId: string
}

export type BlogPostInput = {
  title: string
  shortDescription: string
  content: string
}

export type PostDb = {
  _id?: ObjectId
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt: Date
}

export type PostView = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt: string
}
