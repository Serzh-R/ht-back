import { PostsQuery, PostsQueryOutput } from '../core/types/query.types'
import { PostView } from './posts.types'
import { mapperPostView } from './mappers/mapper-post.view'
import { inject, injectable } from 'inversify'
import { PostModel } from './posts.model'
import { Types } from 'mongoose'
import { LikesQueryRepository } from '../likes/likes.query-repository'
import { LikeStatus } from '../likes/likes.types'

@injectable()
export class PostsQueryRepository {
   constructor(
      @inject(LikesQueryRepository)
      private likesQueryRepository: LikesQueryRepository,
   ) {}

   async findAll(query: PostsQuery, userId: string | null): Promise<PostsQueryOutput> {
      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await PostModel.countDocuments({})

      const posts = await PostModel.find({})
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      const postIds = posts.map((post) => post._id.toString())

      const myStatusesMap = await this.likesQueryRepository.findMyStatuses(postIds, userId)

      const newestLikesMap = await this.likesQueryRepository.findNewestLikes(postIds)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: posts.map((post) => {
            const postId = post._id.toString()

            return mapperPostView(post, {
               likesCount: post.likesCount,
               dislikesCount: post.dislikesCount,
               myStatus: myStatusesMap.get(postId) ?? LikeStatus.None,
               newestLikes: newestLikesMap.get(postId) ?? [],
            })
         }),
      }
   }

   async findById(id: string, userId: string | null): Promise<PostView | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      const post = await PostModel.findById(id)

      if (!post) {
         return null
      }

      const postId = post._id.toString()

      const myStatusesMap = await this.likesQueryRepository.findMyStatuses([postId], userId)

      const newestLikesMap = await this.likesQueryRepository.findNewestLikes([postId])

      return mapperPostView(post, {
         likesCount: post.likesCount,
         dislikesCount: post.dislikesCount,
         myStatus: myStatusesMap.get(postId) ?? LikeStatus.None,
         newestLikes: newestLikesMap.get(postId) ?? [],
      })
   }

   async findPostsByBlogId(
      blogId: string,
      query: PostsQuery,
      userId: string | null,
   ): Promise<PostsQueryOutput> {
      const filter = { blogId }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await PostModel.countDocuments(filter)

      const posts = await PostModel.find(filter)
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      const postIds = posts.map((post) => post._id.toString())

      const myStatusesMap = await this.likesQueryRepository.findMyStatuses(postIds, userId)

      const newestLikesMap = await this.likesQueryRepository.findNewestLikes(postIds)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: posts.map((post) => {
            const postId = post._id.toString()

            return mapperPostView(post, {
               likesCount: post.likesCount,
               dislikesCount: post.dislikesCount,
               myStatus: myStatusesMap.get(postId) ?? LikeStatus.None,
               newestLikes: newestLikesMap.get(postId) ?? [],
            })
         }),
      }
   }
}
