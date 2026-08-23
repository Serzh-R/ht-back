import { BlogInput, BlogView } from './blogs.types'
import { BlogPostInput, PostView } from '../posts/posts.types'
import { BlogsRepository } from './blogs.repository'
import { PostsRepository } from '../posts/posts.repository'
import { inject, injectable } from 'inversify'
import { BlogModel } from './blogs.model'
import { mapperBlogView } from './mappers/mapper-blog.view'
import { PostModel } from '../posts/posts.model'
import { mapperPostView } from '../posts/mappers/mapper-post.view'
import { LikeStatus } from '../likes/likes.types'

@injectable()
export class BlogsService {
   constructor(
      @inject(BlogsRepository) private blogsRepository: BlogsRepository,
      @inject(PostsRepository) private postsRepository: PostsRepository,
   ) {}

   async createBlog(input: BlogInput): Promise<BlogView> {
      const blog = new BlogModel()

      blog.name = input.name
      blog.description = input.description
      blog.websiteUrl = input.websiteUrl
      blog.createdAt = new Date()
      blog.isMembership = false

      await this.blogsRepository.save(blog)

      return mapperBlogView(blog)
   }

   async updateBlog(id: string, input: BlogInput): Promise<boolean> {
      const blog = await this.blogsRepository.findById(id)

      if (!blog) {
         return false
      }

      blog.name = input.name
      blog.description = input.description
      blog.websiteUrl = input.websiteUrl

      await this.blogsRepository.save(blog)

      await this.postsRepository.updateBlogNameForPosts(id, input.name)

      return true
   }

   async createPostByBlogId(blogId: string, input: BlogPostInput): Promise<PostView | null> {
      const blog = await this.blogsRepository.findById(blogId)

      if (!blog) {
         return null
      }

      const post = new PostModel()

      post.title = input.title
      post.shortDescription = input.shortDescription
      post.content = input.content
      post.blogId = blog._id.toString()
      post.blogName = blog.name
      post.createdAt = new Date()
      post.likesCount = 0
      post.dislikesCount = 0

      await this.postsRepository.save(post)

      return mapperPostView(post, {
         likesCount: post.likesCount,
         dislikesCount: post.dislikesCount,
         myStatus: LikeStatus.None,
         newestLikes: [],
      })
   }

   async deleteBlogById(id: string): Promise<boolean> {
      const blog = await this.blogsRepository.findById(id)

      if (!blog) {
         return false
      }

      await this.blogsRepository.delete(blog)

      await this.postsRepository.deletePostsByBlogId(id)

      return true
   }
}
