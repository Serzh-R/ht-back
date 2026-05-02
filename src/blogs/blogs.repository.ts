import { BlogDb, BlogInput, BlogView } from './blogs.types'
import { blogCollection } from '../db/mongo.db'
import { mapperBlogView } from './mappers/mapper.blog-view'
import { ObjectId } from 'mongodb'

export const blogsRepository = {
   async findAll(): Promise<BlogView[]> {
      const blogs = await blogCollection.find({}).toArray()
      return blogs.map(mapperBlogView)
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
