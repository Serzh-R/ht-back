import { injectable } from 'inversify'
import { LikeModel } from './likes.model'
import { LikeStatus } from './likes.types'

@injectable()
export class LikesQueryRepository {
   async findMyStatuses(
      parentIds: string[],
      userId: string | null,
   ): Promise<Map<string, LikeStatus>> {
      const myStatusesMap = new Map<string, LikeStatus>()

      for (const parentId of parentIds) {
         myStatusesMap.set(parentId, LikeStatus.None)
      }

      if (!userId || parentIds.length === 0) {
         return myStatusesMap
      }

      const userLikes = await LikeModel.find({
         authorId: userId,
         parentId: {
            $in: parentIds,
         },
      })

      for (const userLike of userLikes) {
         myStatusesMap.set(userLike.parentId, userLike.status)
      }

      return myStatusesMap
   }
}
