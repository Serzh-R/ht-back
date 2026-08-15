import { HydratedDocument, model, Schema } from 'mongoose'
import { CommentatorInfo, CommentDb } from './comments.types'

const commentatorInfoSchema = new Schema<CommentatorInfo>(
   {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
   },
   {
      _id: false,
   },
)

const commentSchema = new Schema<CommentDb>(
   {
      content: { type: String, required: true },
      commentatorInfo: { type: commentatorInfoSchema, required: true },
      postId: { type: String, required: true },
      createdAt: { type: Date, required: true },
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
   },
   {
      collection: 'comments',
      versionKey: false,
   },
)

export type CommentDocument = HydratedDocument<CommentDb>

export const CommentModel = model<CommentDb>('Comment', commentSchema)
