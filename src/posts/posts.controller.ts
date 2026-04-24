import { Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { HTTP_STATUSES } from '../core/settings'
import { PostInput, PostView } from './posts.types'
import { blogsRepository } from '../blogs/blogs.repository'
import { postsRepository } from './posts.repository'

export const postsController = {
  getPosts(req: Request, res: Response<PostView[]>) {
    const posts = postsRepository.findAll()
    res.status(HTTP_STATUSES.OK_200).json(posts)
  },

  getPostById(req: Request<{ id: string }>, res: Response<PostView>) {
    const post = postsRepository.findById(req.params.id)

    if (!post) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.status(HTTP_STATUSES.OK_200).json(post)
  },

  createPost(req: Request<{}, {}, PostInput>, res: Response<PostView>) {
    const { title, shortDescription, content, blogId} = req.body

    const blog = blogsRepository.findById(blogId.trim())!

    const newPost: PostView = {
      id: randomUUID(),
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
      blogId: blogId.trim(),
      blogName: blog.name,
    }

    const createdPost = postsRepository.create(newPost)
    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
  },

  updatePost(req: Request<{ id: string }, {}, PostInput>, res: Response) {
    const blog = blogsRepository.findById(req.body.blogId.trim())

    if (!blog) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
        errorsMessages: [{ message: 'Invalid blogId', field: 'blogId' }],
      })
      return
    }

    const isUpdated = postsRepository.update(req.params.id, req.body, blog.name)

    if (!isUpdated) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },

  deletePost(req: Request<{ id: string }>, res: Response) {
    const isDeleted = postsRepository.delete(req.params.id)

    if (!isDeleted) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  },
}
