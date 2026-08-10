import { injectable } from 'inversify'
import { Types } from 'mongoose'
import { BlogDocument, BlogModel } from './blogs.model'

@injectable()
export class BlogsRepository {
   async findById(id: string): Promise<BlogDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      return BlogModel.findById(id)
   }

   /*async findById(id: string): Promise<BlogView | null> {
      if (!ObjectId.isValid(id)) {
         return null
      }

      const blog = await blogCollection.findOne({ _id: new ObjectId(id) })

      if (!blog) {
         return null
      }

      return mapperBlogView(blog)
   }*/

   async save(blog: BlogDocument): Promise<void> {
      await blog.save()
   }

   /*async update(id: string, input: BlogInput): Promise<boolean> {
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
   }*/

   async delete(blog: BlogDocument): Promise<void> {
      await blog.deleteOne()
   }

   /*async delete(id: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await blogCollection.deleteOne({
         _id: new ObjectId(id),
      })

      return result.deletedCount === 1
   }*/
}
