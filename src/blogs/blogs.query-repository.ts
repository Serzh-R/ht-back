import { Filter, ObjectId } from 'mongodb'
import { BlogDb, BlogView } from './blogs.types'
import { blogCollection } from '../db/mongo.db'
import { BlogsQuery, BlogsQueryOutput } from '../core/types/query.types'
import { mapperBlogView } from './mappers/mapper-blog.view'

export const blogsQueryRepository = {
   async findAll(query: BlogsQuery): Promise<BlogsQueryOutput> {
      const filter: Filter<BlogDb> = {}

      if (query.searchNameTerm) {
         filter.name = { $regex: query.searchNameTerm, $options: 'i' }
      }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await blogCollection.countDocuments(filter)

      const blogs = await blogCollection
         .find(filter)
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)
         .toArray()

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: blogs.map(mapperBlogView),
      }
   },

   async findById(id: string): Promise<BlogView | null> {
      if (!ObjectId.isValid(id)) {
         return null
      }

      const blog = await blogCollection.findOne({ _id: new ObjectId(id) })

      if (!blog) {
         return null
      }

      return mapperBlogView(blog)
   },
}
