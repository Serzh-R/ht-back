import { Filter, ObjectId } from 'mongodb'
import { commentCollection } from '../db/mongo.db'
import { CommentsQuery, CommentsQueryOutput } from '../core/types/query.types'
import { CommentDb, CommentView } from './comments.types'
import { mapperCommentView } from './mappers/mapper-comment.view'

export const commentsQueryRepository = {
   async findById(id: string): Promise<CommentView | null> {
      if (!ObjectId.isValid(id)) {
         return null
      }

      const comment = await commentCollection.findOne({ _id: new ObjectId(id) })

      if (!comment) {
         return null
      }

      return mapperCommentView(comment)
   },

   async findCommentsByPostId(postId: string, query: CommentsQuery): Promise<CommentsQueryOutput> {
      const filter: Filter<CommentDb> = { postId }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await commentCollection.countDocuments(filter)

      const comments = await commentCollection
         .find(filter)
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)
         .toArray()

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: comments.map(mapperCommentView),
      }
   },
}
