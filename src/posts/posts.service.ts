import { PostInput, PostView } from './posts.types'
import { BlogsRepository } from '../blogs/blogs.repository'
import { PostsRepository } from './posts.repository'
import { inject, injectable } from 'inversify'
import { PostModel } from './posts.model'
import { mapperPostView } from './mappers/mapper-post.view'

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

      const post = new PostModel()

      post.title = input.title
      post.shortDescription = input.shortDescription
      post.content = input.content
      post.blogId = input.blogId
      post.blogName = blog.name
      post.createdAt = new Date()

      await this.postsRepository.save(post)

      return mapperPostView(post)
   }

   async updatePost(id: string, input: PostInput): Promise<boolean> {
      const blog = await this.blogsRepository.findById(input.blogId)

      if (!blog) {
         return false
      }

      const post = await this.postsRepository.findById(id)

      if (!post) {
         return false
      }

      post.title = input.title
      post.shortDescription = input.shortDescription
      post.content = input.content
      post.blogId = input.blogId
      post.blogName = blog.name

      await this.postsRepository.save(post)

      return true
   }

   async deletePost(id: string): Promise<boolean> {
      const post = await this.postsRepository.findById(id)

      if (!post) {
         return false
      }

      await this.postsRepository.delete(post)

      return true
   }
}
