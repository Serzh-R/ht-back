import { BlogInput, BlogView } from './blogs.types'
import { postsRepository } from '../posts/posts.repository'
import { BlogPostInput, PostView } from '../posts/posts.types'
import { BlogsRepository } from './blogs.repository'

export class BlogsService {
   constructor(protected blogsRepository: BlogsRepository) {}

   async createBlog(input: BlogInput): Promise<BlogView> {
      return this.blogsRepository.create(input)
   }

   async updateBlog(id: string, input: BlogInput): Promise<boolean> {
      const isUpdated = await this.blogsRepository.update(id, input)

      if (!isUpdated) {
         return false
      }

      await postsRepository.updateBlogNameForPosts(id, input.name)

      return true
   }

   async createPostByBlogId(blogId: string, input: BlogPostInput): Promise<PostView | null> {
      const blog = await this.blogsRepository.findById(blogId)

      if (!blog) {
         return null
      }

      return postsRepository.create(
         {
            title: input.title,
            shortDescription: input.shortDescription,
            content: input.content,
            blogId: blog.id,
         },
         blog.name,
      )
   }

   async deleteBlogById(id: string): Promise<boolean> {
      const isDeleted = await this.blogsRepository.delete(id)

      if (!isDeleted) {
         return false
      }

      await postsRepository.deletePostsByBlogId(id)

      return true
   }
}
