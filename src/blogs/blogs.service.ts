import { BlogInput, BlogView } from './blogs.types'
import { blogsRepository } from './blogs.repository'
import { postsRepository } from '../posts/posts.repository'
import { BlogPostInput, PostView } from '../posts/posts.types'

export const blogsService = {
   async createBlog(input: BlogInput): Promise<BlogView> {
      return blogsRepository.create(input)
   },

   async updateBlog(id: string, input: BlogInput): Promise<boolean> {
      const isUpdated = await blogsRepository.update(id, input)

      if (!isUpdated) {
         return false
      }

      await postsRepository.updateBlogNameForPosts(id, input.name)

      return true
   },

   async createPostByBlogId(blogId: string, input: BlogPostInput): Promise<PostView | null> {
      const blog = await blogsRepository.findById(blogId)

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
   },

   async deleteBlogById(id: string): Promise<boolean> {
      const isDeleted = await blogsRepository.delete(id)

      if (!isDeleted) {
         return false
      }

      await postsRepository.deletePostsByBlogId(id)

      return true
   },
}
