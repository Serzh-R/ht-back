import { injectable } from 'inversify'
import { CommentDocument, CommentModel } from './comments.model'
import { Types } from 'mongoose'

@injectable()
export class CommentsRepository {
   async findById(id: string): Promise<CommentDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      return CommentModel.findById(id)
   }

   async save(comment: CommentDocument): Promise<void> {
      await comment.save()
   }

   async delete(comment: CommentDocument): Promise<void> {
      await comment.deleteOne()
   }
}
