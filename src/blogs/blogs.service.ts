import { BlogInput } from './blogs.types'
import { blogsRepository } from './blogs.repository'
import { postsRepository } from '../posts/posts.repository'

export const blogsService = {
  async updateBlog(id: string, input: BlogInput): Promise<boolean> {
    const isUpdated = await blogsRepository.update(id, input)

    if (!isUpdated) {
      return false
    }

    await postsRepository.updateBlogNameForPosts(id, input.name)

    return true
  },
}
