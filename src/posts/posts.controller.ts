import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { PostInput, PostView } from './posts.types'
import { blogsRepository } from '../blogs/blogs.repository'
import { postsRepository } from './posts.repository'

export const postsController = {
  async getPosts(req: Request, res: Response<PostView[]>) {
    const posts = await postsRepository.findAll()
    res.status(HTTP_STATUSES.OK_200).json(posts)
  },

  async getPostById(req: Request<{ id: string }>, res: Response<PostView>) {
    const post = await postsRepository.findById(req.params.id)

    if (!post) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.status(HTTP_STATUSES.OK_200).json(post)
  },

  async createPost(req: Request<{}, {}, PostInput>, res: Response) {
    const blog = await blogsRepository.findById(req.body.blogId)

    if (!blog) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [{ message: 'Invalid blogId', field: 'blogId' }],
      })
      return
    }

    const createdPost = await postsRepository.create(req.body, blog.name)

    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
  },

  async updatePost(req: Request<{ id: string }, {}, PostInput>, res: Response) {
    const blog = await blogsRepository.findById(req.body.blogId)

    if (!blog) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [{ message: 'Invalid blogId', field: 'blogId' }],
      })
      return
    }

    const isUpdated = await postsRepository.update(req.params.id, req.body, blog.name)

    if (!isUpdated) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },

  async deletePost(req: Request<{ id: string }>, res: Response) {
    const isDeleted = await postsRepository.delete(req.params.id)

    if (!isDeleted) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },
}
