import { PostsQuery, PostsQueryOutput } from '../core/types/query.types'
import { PostView } from './posts.types'
import { mapperPostView } from './mappers/mapper-post.view'
import { injectable } from 'inversify'
import { PostModel } from './posts.model'
import { Types } from 'mongoose'

@injectable()
export class PostsQueryRepository {
   async findAll(query: PostsQuery): Promise<PostsQueryOutput> {
      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await PostModel.countDocuments({})

      const posts = await PostModel.find({})
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: posts.map(mapperPostView),
      }
   }

   async findById(id: string): Promise<PostView | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      const post = await PostModel.findById(id)

      if (!post) {
         return null
      }

      return mapperPostView(post)
   }

   async findPostsByBlogId(blogId: string, query: PostsQuery): Promise<PostsQueryOutput> {
      const filter = { blogId }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await PostModel.countDocuments(filter)

      const posts = await PostModel.find(filter)
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: posts.map(mapperPostView),
      }
   }
}
