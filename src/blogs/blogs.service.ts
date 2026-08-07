import { BlogInput, BlogView } from './blogs.types'
import { BlogPostInput, PostView } from '../posts/posts.types'
import { BlogsRepository } from './blogs.repository'
import { PostsRepository } from '../posts/posts.repository'
import { inject, injectable } from 'inversify'

@injectable()
export class BlogsService {
   constructor(
      @inject(BlogsRepository) private blogsRepository: BlogsRepository,
      @inject(PostsRepository) private postsRepository: PostsRepository,
   ) {}

   async createBlog(input: BlogInput): Promise<BlogView> {
      return this.blogsRepository.create(input)
   }

   async updateBlog(id: string, input: BlogInput): Promise<boolean> {
      const isUpdated = await this.blogsRepository.update(id, input)

      if (!isUpdated) {
         return false
      }

      await this.postsRepository.updateBlogNameForPosts(id, input.name)

      return true
   }

   async createPostByBlogId(blogId: string, input: BlogPostInput): Promise<PostView | null> {
      const blog = await this.blogsRepository.findById(blogId)

      if (!blog) {
         return null
      }

      return this.postsRepository.create(
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

      await this.postsRepository.deletePostsByBlogId(id)

      return true
   }
}
