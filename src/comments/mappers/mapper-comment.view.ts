import { WithId } from 'mongodb'
import { CommentDb, CommentView } from '../comments.types'

export const mapperCommentView = (comment: WithId<CommentDb>): CommentView => {
   return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt.toISOString(),
   }
}
