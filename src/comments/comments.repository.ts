import { ObjectId, WithId } from 'mongodb'
import { commentCollection } from '../db/mongo.db'
import { CommentDb, CommentInput, CommentatorInfo, CommentView } from './comments.types'
import { mapperCommentView } from './mappers/mapper-comment.view'
import { injectable } from 'inversify'

@injectable()
export class CommentsRepository {
   async findById(id: string): Promise<WithId<CommentDb> | null> {
      if (!ObjectId.isValid(id)) {
         return null
      }

      return commentCollection.findOne({ _id: new ObjectId(id) })
   }

   async create(
      input: CommentInput,
      postId: string,
      commentatorInfo: CommentatorInfo,
   ): Promise<CommentView> {
      const newComment: CommentDb = {
         content: input.content,
         commentatorInfo,
         postId,
         createdAt: new Date(),
      }

      const result = await commentCollection.insertOne(newComment)

      const createdComment = await commentCollection.findOne({
         _id: result.insertedId,
      })

      if (!createdComment) {
         throw new Error('Comment was not created')
      }

      return mapperCommentView(createdComment)
   }

   async update(id: string, content: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await commentCollection.updateOne(
         { _id: new ObjectId(id) },
         {
            $set: {
               content,
            },
         },
      )

      return result.matchedCount === 1
   }

   async delete(id: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await commentCollection.deleteOne({
         _id: new ObjectId(id),
      })

      return result.deletedCount === 1
   }
}
