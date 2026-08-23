export enum LikeStatus {
   None = 'None',
   Like = 'Like',
   Dislike = 'Dislike',
}

export type LikeInput = {
   likeStatus: LikeStatus
}

export type LikeDb = {
   createdAt: Date
   status: LikeStatus.Like | LikeStatus.Dislike
   authorId: string
   parentId: string
}

export type LikesInfoView = {
   likesCount: number
   dislikesCount: number
   myStatus: LikeStatus
}

export type LikeDetailsView = {
   addedAt: string
   userId: string
   login: string
}

export type ExtendedLikesInfoView = LikesInfoView & {
   newestLikes: LikeDetailsView[]
}
