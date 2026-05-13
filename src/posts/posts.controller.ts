import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { PostInput, PostView } from './posts.types'
import { Paginator } from '../core/types/paginator.types'
import { PostsQueryInput } from '../core/types/query.types'
import { normalizePostsQuery } from '../core/helpers/query-normalizers'
import { postsQueryRepository } from './posts.query-repository'
import { postsService } from './posts.service'

export const postsController = {
   async getPosts(
      req: Request<{}, Paginator<PostView>, {}, PostsQueryInput>,
      res: Response<Paginator<PostView>>,
   ) {
      const query = normalizePostsQuery(req.query)

      const posts = await postsQueryRepository.findAll(query)

      res.status(HTTP_STATUSES.OK_200).json(posts)
   },

   async getPostById(req: Request<{ id: string }>, res: Response<PostView>) {
      const post = await postsQueryRepository.findById(req.params.id)

      if (!post) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.OK_200).json(post)
   },

   async createPost(req: Request<{}, {}, PostInput>, res: Response) {
      const createdPost = await postsService.createPost(req.body)

      if (!createdPost) {
         res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages: [{ message: 'Invalid blogId', field: 'blogId' }],
         })
         return
      }

      res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
   },

   async updatePost(req: Request<{ id: string }, {}, PostInput>, res: Response) {
      const isUpdated = await postsService.updatePost(req.params.id, req.body)

      if (!isUpdated) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },

   async deletePost(req: Request<{ id: string }>, res: Response) {
      const isDeleted = await postsService.deletePost(req.params.id)

      if (!isDeleted) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },
}
