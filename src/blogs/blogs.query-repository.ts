import { BlogView } from './blogs.types'
import { BlogsQuery, BlogsQueryOutput } from '../core/types/query.types'
import { BlogModel } from './blogs.model'
import { mapperBlogView } from './mappers/mapper-blog.view'
import { Types } from 'mongoose'
import { injectable } from 'inversify'

@injectable()
export class BlogsQueryRepository {
   async findAll(query: BlogsQuery): Promise<BlogsQueryOutput> {
      let filter = {}

      if (query.searchNameTerm) {
         filter = {
            name: {
               $regex: query.searchNameTerm,
               $options: 'i',
            },
         }
      }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await BlogModel.countDocuments(filter)

      const blogs = await BlogModel.find(filter)
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: blogs.map(mapperBlogView),
      }
   }

   async findById(id: string): Promise<BlogView | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      const blog = await BlogModel.findById(id)

      if (!blog) {
         return null
      }

      return mapperBlogView(blog)
   }
}
