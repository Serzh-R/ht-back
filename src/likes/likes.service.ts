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

         await this.likesRepository.save(like)

         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      if (input.likeStatus === LikeStatus.None) {
         await this.likesRepository.delete(existingLike)

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

      existingLike.status = input.likeStatus

      await this.likesRepository.save(existingLike)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
