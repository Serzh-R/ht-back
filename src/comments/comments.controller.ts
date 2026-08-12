import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { CommentInput, CommentView } from './comments.types'
import { ResultStatus } from '../core/result/result.types'
import { CommentsService } from './comments.service'
import { CommentsQueryRepository } from './comments.query-repository'
import { inject, injectable } from 'inversify'

@injectable()
export class CommentsController {
   constructor(
      @inject(CommentsService) private commentsService: CommentsService,
      @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
   ) {}

   async getCommentById(req: Request<{ id: string }>, res: Response<CommentView>) {
      const comment = await this.commentsQueryRepository.findById(req.params.id)

      if (!comment) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.status(HTTP_STATUSES.OK_200).json(comment)
   }

   async updateComment(req: Request<{ commentId: string }, {}, CommentInput>, res: Response) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const result = await this.commentsService.updateComment(
         req.params.commentId,
         req.body,
         req.userId,
      )

      if (result.status === ResultStatus.NotFound) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      if (result.status === ResultStatus.Forbidden) {
         res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   }

   async deleteComment(req: Request<{ commentId: string }>, res: Response) {
      if (!req.userId) {
         res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
         return
      }

      const result = await this.commentsService.deleteComment(req.params.commentId, req.userId)

      if (result.status === ResultStatus.NotFound) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      if (result.status === ResultStatus.Forbidden) {
         res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   }
}
