import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { BlogInput, BlogPostsParams, BlogView } from './blogs.types'
import { blogsRepository } from './blogs.repository'
import { blogsService } from './blogs.service'
import { BlogsQueryInput, PostsByBlogQueryInput } from '../core/types/query.types'
import { Paginator } from '../core/types/paginator.types'
import { normalizeBlogsQuery, normalizePostsQuery } from '../core/helpers/query-normalizers'
import { BlogPostInput, PostView } from '../posts/posts.types'
import { postsRepository } from '../posts/posts.repository'
import { blogsQueryRepository } from './blogs.query-repository'

export const blogsController = {
   async getBlogs(
      req: Request<{}, Paginator<BlogView>, {}, BlogsQueryInput>,
      res: Response<Paginator<BlogView>>,
   ) {
      const query = normalizeBlogsQuery(req.query)

      const blogs = await blogsQueryRepository.findAll(query)

      res.status(HTTP_STATUSES.OK_200).json(blogs)
   },

   async getBlogById(req: Request<{ id: string }>, res: Response<BlogView>) {
      const blog = await blogsQueryRepository.findById(req.params.id)

      if (!blog) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.OK_200).json(blog)
   },

   async getPostsByBlogId(
      req: Request<BlogPostsParams, Paginator<PostView>, {}, PostsByBlogQueryInput>,
      res: Response<Paginator<PostView>>,
   ) {
      const blogId = req.params.blogId

      const blog = await blogsRepository.findById(blogId)

      if (!blog) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      const query = normalizePostsQuery(req.query)

      const posts = await postsRepository.findPostsByBlogId(blogId, query)

      res.status(HTTP_STATUSES.OK_200).send(posts)
   },

   async createBlog(req: Request<{}, {}, BlogInput>, res: Response<BlogView>) {
      const createdBlog = await blogsRepository.create(req.body)

      res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
   },

   async createPostByBlogId(
      req: Request<BlogPostsParams, PostView, BlogPostInput>,
      res: Response<PostView>,
   ) {
      const createdPost = await blogsService.createPostByBlogId(req.params.blogId, req.body)

      if (!createdPost) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
   },

   async updateBlog(req: Request<{ id: string }, {}, BlogInput>, res: Response) {
      const isUpdated = await blogsService.updateBlog(req.params.id, req.body)

      if (!isUpdated) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async deleteBlogById(req: Request<{ id: string }>, res: Response) {
      const isDeleted = await blogsService.deleteBlogById(req.params.id)

      if (!isDeleted) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },
}
