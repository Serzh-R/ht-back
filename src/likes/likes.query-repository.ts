import { injectable } from 'inversify'
import { LikeModel } from './likes.model'
import { LikeDetailsView, LikeStatus } from './likes.types'

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

   async findNewestLikes(parentIds: string[]): Promise<Map<string, LikeDetailsView[]>> {
      const newestLikesMap = new Map<string, LikeDetailsView[]>()

      for (const parentId of parentIds) {
         newestLikesMap.set(parentId, [])
      }

      if (parentIds.length === 0) {
         return newestLikesMap
      }

      const likes = await LikeModel.find({
         parentId: {
            $in: parentIds,
         },
         status: LikeStatus.Like,
      }).sort({
         createdAt: -1,
      })

      for (const like of likes) {
         const newestLikes = newestLikesMap.get(like.parentId)

         if (!newestLikes) {
            continue
         }

         if (newestLikes.length >= 3) {
            continue
         }

         newestLikes.push({
            addedAt: like.createdAt.toISOString(),
            userId: like.authorId,
            login: like.authorLogin,
         })
      }

      return newestLikesMap
   }
}
