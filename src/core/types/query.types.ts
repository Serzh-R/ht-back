import { UserView } from '../../users/users.types'
import { Paginator } from './paginator.types'
import { BlogView } from '../../blogs/blogs.types'
import { PostView } from '../../posts/posts.types'
import { CommentView } from '../../comments/comments.types'

export type SortDirections = 'asc' | 'desc'

/************ blogs query ******************************/

export type BlogsQueryInput = {
   searchNameTerm?: string
   sortBy?: string
   sortDirection?: string
   pageNumber?: string
   pageSize?: string
}

export type BlogsQuery = {
   searchNameTerm: string | null
   sortBy: string
   sortDirection: SortDirections
   pageNumber: number
   pageSize: number
}

export type BlogsQueryOutput = Paginator<BlogView>

/***************** posts query *********************************/

export type PostsQueryInput = {
   sortBy?: string
   sortDirection?: string
   pageNumber?: string
   pageSize?: string
}

export type PostsQuery = {
   sortBy: string
   sortDirection: SortDirections
   pageNumber: number
   pageSize: number
}

export type PostsQueryOutput = Paginator<PostView>

export type PostsByBlogQueryInput = PostsQueryInput

export type PostsByBlogQuery = PostsQuery

/******************* comments query ***********************************/

export type CommentsQueryInput = PostsQueryInput

export type CommentsQuery = PostsQuery

export type CommentsQueryOutput = Paginator<CommentView>

/****************** users query ************************************/

export type UsersQueryInput = {
   searchLoginTerm?: string
   searchEmailTerm?: string
   sortBy?: string
   sortDirection?: string
   pageNumber?: string
   pageSize?: string
}

export type UsersQuery = {
   searchLoginTerm: string | null
   searchEmailTerm: string | null
   sortBy: string
   sortDirection: SortDirections
   pageNumber: number
   pageSize: number
}

export type UsersQueryOutput = Paginator<UserView>
