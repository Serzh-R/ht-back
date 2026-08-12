import { CommentsQuery, CommentsQueryOutput } from '../core/types/query.types'
import { CommentView } from './comments.types'
import { mapperCommentView } from './mappers/mapper-comment.view'
import { injectable } from 'inversify'
import { Types } from 'mongoose'
import { CommentModel } from './comments.model'

@injectable()
export class CommentsQueryRepository {
   async findById(id: string): Promise<CommentView | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      const comment = await CommentModel.findById(id)

      if (!comment) {
         return null
      }

      return mapperCommentView(comment)
   }

   async findCommentsByPostId(postId: string, query: CommentsQuery): Promise<CommentsQueryOutput> {
      const filter = { postId }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await CommentModel.countDocuments(filter)

      const comments = await CommentModel.find(filter)
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: comments.map(mapperCommentView),
      }
   }
}
