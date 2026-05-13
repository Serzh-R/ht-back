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
}
