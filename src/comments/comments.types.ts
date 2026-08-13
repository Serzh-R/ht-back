import { LikesInfoView } from '../likes/likes.types'

export type CommentInput = {
   content: string
}

export type CommentatorInfo = {
   userId: string
   userLogin: string
}

export type CommentDb = {
   content: string
   commentatorInfo: CommentatorInfo
   postId: string
   createdAt: Date
}

export type CommentView = {
   id: string
   content: string
   commentatorInfo: CommentatorInfo
   createdAt: string
   likesInfo: LikesInfoView
}
