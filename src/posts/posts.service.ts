import { PostInput, PostView } from './posts.types'
import { BlogsRepository } from '../blogs/blogs.repository'
import { PostsRepository } from './posts.repository'
import { inject, injectable } from 'inversify'

@injectable()
export class PostsService {
   constructor(
      @inject(BlogsRepository) private blogsRepository: BlogsRepository,
      @inject(PostsRepository) private postsRepository: PostsRepository,
   ) {}

   async createPost(input: PostInput): Promise<PostView | null> {
      const blog = await this.blogsRepository.findById(input.blogId)

      if (!blog) {
         return null
      }

      return this.postsRepository.create(input, blog.name)
   }

   async updatePost(id: string, input: PostInput): Promise<boolean> {
      const blog = await this.blogsRepository.findById(input.blogId)

      if (!blog) {
         return false
      }

      return this.postsRepository.update(id, input, blog.name)
   }

   async deletePost(id: string): Promise<boolean> {
      return this.postsRepository.delete(id)
   }
}
