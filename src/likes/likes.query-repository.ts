import { injectable } from 'inversify'
import { LikeModel } from './likes.model'
import { LikesInfoView, LikeStatus } from './likes.types'

type LikesCountAggregation = {
   _id: string
   likesCount: number
   dislikesCount: number
}

@injectable()
export class LikesQueryRepository {
   async findLikesInfo(
      parentIds: string[],
      userId: string | null,
   ): Promise<Map<string, LikesInfoView>> {
      const likesInfoMap = new Map<string, LikesInfoView>()

      for (const parentId of parentIds) {
         likesInfoMap.set(parentId, {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
         })
      }

      if (parentIds.length === 0) {
         return likesInfoMap
      }

      const likesCounts = await LikeModel.aggregate<LikesCountAggregation>([
         {
            $match: {
               parentId: {
                  $in: parentIds,
               },
            },
         },
         {
            $group: {
               _id: '$parentId',
               likesCount: {
                  $sum: {
                     $cond: [{ $eq: ['$status', LikeStatus.Like] }, 1, 0],
                  },
               },
               dislikesCount: {
                  $sum: {
                     $cond: [{ $eq: ['$status', LikeStatus.Dislike] }, 1, 0],
                  },
               },
            },
         },
      ])

      for (const likesCount of likesCounts) {
         const likesInfo = likesInfoMap.get(likesCount._id)

         if (likesInfo) {
            likesInfo.likesCount = likesCount.likesCount
            likesInfo.dislikesCount = likesCount.dislikesCount
         }
      }

      if (!userId) {
         return likesInfoMap
      }

      const userLikes = await LikeModel.find({
         authorId: userId,
         parentId: {
            $in: parentIds,
         },
      })

      for (const userLike of userLikes) {
         const likesInfo = likesInfoMap.get(userLike.parentId)

         if (likesInfo) {
            likesInfo.myStatus = userLike.status
         }
      }

      return likesInfoMap
   }
}
