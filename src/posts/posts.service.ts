import { PostInput, PostView } from './posts.types'
import { blogsRepository } from '../blogs/blogs.repository'
import { postsRepository } from './posts.repository'

export const postsService = {
   async createPost(input: PostInput): Promise<PostView | null> {
      const blog = await blogsRepository.findById(input.blogId)

      if (!blog) {
         return null
      }

      return postsRepository.create(input, blog.name)
   },

   async updatePost(id: string, input: PostInput): Promise<boolean> {
      const blog = await blogsRepository.findById(input.blogId)

      if (!blog) {
         return false
      }

      return postsRepository.update(id, input, blog.name)
   },

   async deletePost(id: string): Promise<boolean> {
      return postsRepository.delete(id)
   },
}
