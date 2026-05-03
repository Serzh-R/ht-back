import { BlogDb, BlogInput, BlogView } from './blogs.types'
import { blogCollection } from '../db/mongo.db'
import { mapperBlogView } from './mappers/mapper.blog-view'
import { Filter, ObjectId } from 'mongodb'
import { BlogsQuery } from '../core/types/query.types'
import { Paginator } from '../core/types/paginator.types'

export const blogsRepository = {
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

   async create(input: BlogInput): Promise<BlogView> {
      const newBlog: BlogDb = {
         name: input.name,
         description: input.description,
         websiteUrl: input.websiteUrl,
         createdAt: new Date(),
         isMembership: false,
      }

      const result = await blogCollection.insertOne(newBlog)

      const createdBlog = await blogCollection.findOne({
         _id: result.insertedId,
      })

      if (!createdBlog) {
         throw new Error('Blog was not created')
      }

      return mapperBlogView(createdBlog)
   },

   async update(id: string, input: BlogInput): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await blogCollection.updateOne(
         { _id: new ObjectId(id) },
         {
            $set: {
               name: input.name,
               description: input.description,
               websiteUrl: input.websiteUrl,
            },
         },
      )

      return result.matchedCount === 1
   },

   async delete(id: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await blogCollection.deleteOne({
         _id: new ObjectId(id),
      })

      return result.deletedCount === 1
   },
}
