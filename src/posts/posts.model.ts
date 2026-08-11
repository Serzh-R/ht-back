import { HydratedDocument, model, Model, Schema } from 'mongoose'
import { PostDb } from './posts.types'

export type PostDocument = HydratedDocument<PostDb>

type PostModelType = Model<PostDb>

const postSchema = new Schema<PostDb>(
   {
      title: { type: String, required: true },
      shortDescription: { type: String, required: true },
      content: { type: String, required: true },
      blogId: { type: String, required: true },
      blogName: { type: String, required: true },
      createdAt: { type: Date, required: true },
   },
   {
      collection: 'posts',
      versionKey: false,
   },
)

export const PostModel = model<PostDb, PostModelType>('Post', postSchema)
