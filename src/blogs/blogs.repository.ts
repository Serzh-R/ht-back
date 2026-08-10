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

   async save(blog: BlogDocument): Promise<void> {
      await blog.save()
   }

   async delete(blog: BlogDocument): Promise<void> {
      await blog.deleteOne()
   }
}
