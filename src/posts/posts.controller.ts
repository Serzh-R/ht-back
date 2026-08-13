import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { PostInput, PostView } from './posts.types'
import { Paginator } from '../core/types/paginator.types'
import { CommentsQueryInput, PostsQueryInput } from '../core/types/query.types'
import { normalizeCommentsQuery, normalizePostsQuery } from '../core/helpers/query-normalizers'
import { CommentInput, CommentView } from '../comments/comments.types'
import { ResultStatus } from '../core/result/result.types'
import { resultCodeToHttpException } from '../core/result/result-code-to-http-exception'
import { PostsService } from './posts.service'
import { PostsQueryRepository } from './posts.query-repository'
import { CommentsService } from '../comments/comments.service'
import { CommentsQueryRepository } from '../comments/comments.query-repository'
import { inject, injectable } from 'inversify'

@injectable()
export class PostsController {
   constructor(
      @inject(PostsService) private postsService: PostsService,
      @inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
      @inject(CommentsService) private commentsService: CommentsService,
      @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
   ) {}

   async getPosts(
      req: Request<{}, Paginator<PostView>, {}, PostsQueryInput>,
      res: Response<Paginator<PostView>>,
   ) {
      const query = normalizePostsQuery(req.query)

      const posts = await this.postsQueryRepository.findAll(query)

      res.status(HTTP_STATUSES.OK_200).json(posts)
   }

   async getPostById(req: Request<{ id: string }>, res: Response<PostView>) {
      const post = await this.postsQueryRepository.findById(req.params.id)

      if (!post) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.OK_200).json(post)
   }

   async createPost(req: Request<{}, {}, PostInput>, res: Response) {
      const createdPost = await this.postsService.createPost(req.body)

      if (!createdPost) {
         res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages: [{ message: 'Invalid blogId', field: 'blogId' }],
         })
         return
      }

      res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
   }

   async createCommentByPostId(
      req: Request<{ postId: string }, {}, CommentInput>,
      res: Response<CommentView>,
   ) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const result = await this.commentsService.createComment(
         req.body,
         req.params.postId,
         req.userId,
      )

      if (result.status !== ResultStatus.Created) {
         res.sendStatus(resultCodeToHttpException(result.status))
         return
      }

      res.status(HTTP_STATUSES.CREATED_201).json(result.data!)
   }

   async getCommentsByPostId(
      req: Request<{ postId: string }, Paginator<CommentView>, {}, CommentsQueryInput>,
      res: Response<Paginator<CommentView>>,
   ) {
      const post = await this.postsQueryRepository.findById(req.params.postId)

      if (!post) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      const query = normalizeCommentsQuery(req.query)

      const comments = await this.commentsQueryRepository.findCommentsByPostId(
         req.params.postId,
         query,
         req.userId ?? null,
      )

      res.status(HTTP_STATUSES.OK_200).json(comments)
   }

   async updatePost(req: Request<{ id: string }, {}, PostInput>, res: Response) {
      const isUpdated = await this.postsService.updatePost(req.params.id, req.body)

      if (!isUpdated) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   }

   async deletePost(req: Request<{ id: string }>, res: Response) {
      const isDeleted = await this.postsService.deletePost(req.params.id)

      if (!isDeleted) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   }
}

/*async createCommentByPostId(
      req: Request<{ postId: string }, {}, CommentInput>,
      res: Response<CommentView>,
   ) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const post = await postsQueryRepository.findById(req.params.postId)

      if (!post) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      const user = await usersRepository.findById(req.userId)

      if (!user) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const result = await commentsService.createComment(req.body, req.params.postId, {
         userId: req.userId,
         userLogin: user.login,
      })

      res.status(HTTP_STATUSES.CREATED_201).json(result.data!)
   },*/
