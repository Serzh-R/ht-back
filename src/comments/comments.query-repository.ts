import { CommentsQuery, CommentsQueryOutput } from '../core/types/query.types'
import { CommentView } from './comments.types'
import { mapperCommentView } from './mappers/mapper-comment.view'
import { inject, injectable } from 'inversify'
import { Types } from 'mongoose'
import { CommentModel } from './comments.model'
import { LikesQueryRepository } from '../likes/likes.query-repository'

@injectable()
export class CommentsQueryRepository {
   constructor(
      @inject(LikesQueryRepository)
      private likesQueryRepository: LikesQueryRepository,
   ) {}

   async findById(id: string, userId: string | null): Promise<CommentView | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      const comment = await CommentModel.findById(id)

      if (!comment) {
         return null
      }

      const commentId = comment._id.toString()

      const likesInfoMap = await this.likesQueryRepository.findLikesInfo([commentId], userId)

      const likesInfo = likesInfoMap.get(commentId)!

      return mapperCommentView(comment, likesInfo)
   }

   async findCommentsByPostId(
      postId: string,
      query: CommentsQuery,
      userId: string | null,
   ): Promise<CommentsQueryOutput> {
      const filter = { postId }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await CommentModel.countDocuments(filter)

      const comments = await CommentModel.find(filter)
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      const commentIds = comments.map((comment) => comment._id.toString())

      const likesInfoMap = await this.likesQueryRepository.findLikesInfo(commentIds, userId)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: comments.map((comment) => {
            const commentId = comment._id.toString()
            const likesInfo = likesInfoMap.get(commentId)!

            return mapperCommentView(comment, likesInfo)
         }),
      }
   }
}
