import { CommentInput, CommentatorInfo, CommentView } from './comments.types'
import { commentsRepository } from './comments.repository'
import { Result, ResultStatus } from '../core/result/result.types'

export const commentsService = {
   async createComment(
      input: CommentInput,
      postId: string,
      commentatorInfo: CommentatorInfo,
   ): Promise<Result<CommentView>> {
      const createdComment = await commentsRepository.create(input, postId, commentatorInfo)

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: createdComment,
      }
   },

   async updateComment(commentId: string, input: CommentInput, userId: string): Promise<Result> {
      const comment = await commentsRepository.findById(commentId)

      if (!comment) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      if (comment.commentatorInfo.userId !== userId) {
         return {
            status: ResultStatus.Forbidden,
            extensions: [],
            data: null,
         }
      }

      const isUpdated = await commentsRepository.update(commentId, input.content)

      if (!isUpdated) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },

   async deleteComment(commentId: string, userId: string): Promise<Result> {
      const comment = await commentsRepository.findById(commentId)

      if (!comment) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      if (comment.commentatorInfo.userId !== userId) {
         return {
            status: ResultStatus.Forbidden,
            extensions: [],
            data: null,
         }
      }

      const isDeleted = await commentsRepository.delete(commentId)

      if (!isDeleted) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },
}
