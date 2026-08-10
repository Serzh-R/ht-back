import { HydratedDocument, Model, model, Schema } from 'mongoose'
import { BlogDb } from './blogs.types'

export type BlogDocument = HydratedDocument<BlogDb>

type BlogModelType = Model<BlogDb>

const blogSchema = new Schema<Omit<BlogDb, '_id'>>(
   {
      name: { type: String, required: true },
      description: { type: String, required: true },
      websiteUrl: { type: String, required: true },
      createdAt: { type: Date, required: true },
      isMembership: { type: Boolean, required: true },
   },
   {
      collection: 'blogs',
      versionKey: false,
   },
)

export const BlogModel = model<BlogDb, BlogModelType>('Blog', blogSchema)
