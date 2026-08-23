import { HydratedDocument, model, Schema } from 'mongoose'
import { LikeDb, LikeStatus } from './likes.types'

const likeSchema = new Schema<LikeDb>(
   {
      createdAt: { type: Date, required: true },
      status: { type: String, enum: [LikeStatus.Like, LikeStatus.Dislike], required: true },
      authorId: { type: String, required: true },
      authorLogin: { type: String, required: true },
      parentId: { type: String, required: true },
   },
   {
      collection: 'likes',
      versionKey: false,
   },
)

likeSchema.index(
   {
      authorId: 1,
      parentId: 1,
   },
   {
      unique: true,
   },
)

export type LikeDocument = HydratedDocument<LikeDb>

export const LikeModel = model<LikeDb>('Like', likeSchema)
