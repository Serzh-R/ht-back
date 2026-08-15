import { inject, injectable } from 'inversify'
import { CommentsRepository } from '../comments/comments.repository'
import { Result, ResultStatus } from '../core/result/result.types'
import { LikeModel } from './likes.model'
import { LikesRepository } from './likes.repository'
import { LikeInput, LikeStatus } from './likes.types'

@injectable()
export class LikesService {
   constructor(
      @inject(LikesRepository) private likesRepository: LikesRepository,
      @inject(CommentsRepository) private commentsRepository: CommentsRepository,
   ) {}

   async updateLikeStatus(commentId: string, userId: string, input: LikeInput): Promise<Result> {
      const comment = await this.commentsRepository.findById(commentId)

      if (!comment) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      const existingLike = await this.likesRepository.findByAuthorIdAndParentId(userId, commentId)

      if (!existingLike) {
         if (input.likeStatus === LikeStatus.None) {
            return {
               status: ResultStatus.NoContent,
               extensions: [],
               data: null,
            }
         }

         const like = new LikeModel()

         like.createdAt = new Date()
         like.status = input.likeStatus
         like.authorId = userId
         like.parentId = commentId

         if (input.likeStatus === LikeStatus.Like) {
            comment.likesCount += 1
         }

         if (input.likeStatus === LikeStatus.Dislike) {
            comment.dislikesCount += 1
         }

         await this.likesRepository.save(like)

         await this.commentsRepository.save(comment)

         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      if (input.likeStatus === LikeStatus.None) {
         if (existingLike.status === LikeStatus.Like) {
            comment.likesCount -= 1
         }

         if (existingLike.status === LikeStatus.Dislike) {
            comment.dislikesCount -= 1
         }

         await this.likesRepository.delete(existingLike)

         await this.commentsRepository.save(comment)

         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      if (existingLike.status === input.likeStatus) {
         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      if (existingLike.status === LikeStatus.Like) {
         comment.likesCount -= 1
         comment.dislikesCount += 1
      }

      if (existingLike.status === LikeStatus.Dislike) {
         comment.dislikesCount -= 1
         comment.likesCount += 1
      }

      existingLike.status = input.likeStatus

      await this.likesRepository.save(existingLike)

      await this.commentsRepository.save(comment)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
