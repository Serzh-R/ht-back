import { Filter, ObjectId } from 'mongodb'
import { BlogDb, BlogView } from './blogs.types'
import { blogCollection } from '../db/mongo.db'
import { BlogsQuery } from '../core/types/query.types'
import { Paginator } from '../core/types/paginator.types'
import { mapBlogView } from './mappers/map-blog.view'

export const blogsQueryRepository = {
   async findAll(query: BlogsQuery): Promise<Paginator<BlogView>> {
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
         items: blogs.map(mapBlogView),
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

      return mapBlogView(blog)
   },
}
