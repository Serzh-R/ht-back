import { ExtendedLikesInfoView } from '../likes/likes.types'

export type PostInput = {
   title: string
   shortDescription: string
   content: string
   blogId: string
}

export type BlogPostInput = {
   title: string
   shortDescription: string
   content: string
}

export type PostDb = {
   title: string
   shortDescription: string
   content: string
   blogId: string
   blogName: string
   createdAt: Date
   likesCount: number
   dislikesCount: number
}

export type PostView = {
   id: string
   title: string
   shortDescription: string
   content: string
   blogId: string
   blogName: string
   createdAt: string
   extendedLikesInfo: ExtendedLikesInfoView
}
