import { injectable } from 'inversify'
import { LikeDocument, LikeModel } from './likes.model'

@injectable()
export class LikesRepository {
   async findByAuthorIdAndParentId(
      authorId: string,
      parentId: string,
   ): Promise<LikeDocument | null> {
      return LikeModel.findOne({
         authorId,
         parentId,
      })
   }

   async save(like: LikeDocument): Promise<void> {
      await like.save()
   }

   async delete(like: LikeDocument): Promise<void> {
      await like.deleteOne()
   }

   async deleteByParentId(parentId: string): Promise<void> {
      await LikeModel.deleteMany({
         parentId,
      })
   }
}
