import { ObjectId } from 'mongodb'

export type CommentInput = {
   content: string
}

export type CommentatorInfo = {
   userId: string
   userLogin: string
}

export type CommentDb = {
   _id?: ObjectId
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
}
