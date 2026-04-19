import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../settings'
import { BlogInput, BlogView } from './blogs.types'
import { blogFieldValidator } from '../validation/custom-validator/fieldValidator'
import { randomUUID } from 'node:crypto'
import { blogsRepository } from './blogs.repository'

export const blogsController = {
  getBlogs(req: Request, res: Response<BlogView[]>) {
    const blogs = blogsRepository.findAll()
    res.status(HTTP_STATUSES.OK_200).json(blogs)
  },

  createBlog(req: Request<{}, {}, BlogInput>, res: Response<BlogView>) {
    const errorsMessages = blogFieldValidator(req.body)

    const { name, description, websiteUrl } = req.body

    const newBlog: BlogView = {
      id: String(randomUUID()),
      name: name.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
    }

    const createdBlog = blogsRepository.create(newBlog)

    res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
  },

  getBlogById(req: Request<{ id: string }>, res: Response<BlogView>) {
    const blog = blogsRepository.findById(req.params.id)

    if (!blog) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.status(HTTP_STATUSES.OK_200).json(blog)
  },

  updateBlog(req: Request<{ id: string }, {}, BlogInput>, res: Response) {
    const isUpdated = blogsRepository.update(req.params.id, req.body)

    if (!isUpdated) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },

  deleteBlogById(req: Request<{ id: string }>, res: Response) {
    const isDeleted = blogsRepository.delete(req.params.id)

    if (!isDeleted) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },
}
