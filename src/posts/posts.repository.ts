import { injectable } from 'inversify'
import { PostDocument, PostModel } from './posts.model'
import { Types } from 'mongoose'

@injectable()
export class PostsRepository {
   async save(post: PostDocument): Promise<void> {
      await post.save()
   }

   async findById(id: string): Promise<PostDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      return PostModel.findById(id)
   }

   async findPostIdsByBlogId(blogId: string): Promise<string[]> {
      const posts = await PostModel.find({
         blogId,
      }).select({
         _id: 1,
      })

      return posts.map((post) => post._id.toString())
   }

   async updateBlogNameForPosts(blogId: string, blogName: string): Promise<void> {
      await PostModel.updateMany(
         { blogId },
         {
            $set: {
               blogName,
            },
         },
      )
   }

   async deletePostsByBlogId(blogId: string): Promise<void> {
      await PostModel.deleteMany({ blogId })
   }

   async delete(post: PostDocument): Promise<void> {
      await post.deleteOne()
   }
}
