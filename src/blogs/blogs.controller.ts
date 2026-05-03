import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { BlogInput, BlogView } from './blogs.types'
import { blogsRepository } from './blogs.repository'
import { blogsService } from './blogs.service'
import { BlogsQueryInput } from '../core/types/query.types'
import { Paginator } from '../core/types/paginator.types'
import { normalizeBlogsQuery } from '../core/helpers/query-normalizers'

export const blogsController = {
   async getBlogs(
      req: Request<{}, Paginator<BlogView>, {}, BlogsQueryInput>,
      res: Response<Paginator<BlogView>>,
   ) {
      const query = normalizeBlogsQuery(req.query)

      const blogs = await blogsRepository.findAll(query)

      res.status(HTTP_STATUSES.OK_200).send(blogs)
   },

   async getBlogById(req: Request<{ id: string }>, res: Response<BlogView>) {
      const blog = await blogsRepository.findById(req.params.id)

      if (!blog) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.OK_200).json(blog)
   },

   async createBlog(req: Request<{}, {}, BlogInput>, res: Response<BlogView>) {
      const createdBlog = await blogsRepository.create(req.body)

      res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
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
