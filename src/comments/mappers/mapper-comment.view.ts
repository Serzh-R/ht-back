import { CommentView } from '../comments.types'
import { CommentDocument } from '../comments.model'

export const mapperCommentView = (comment: CommentDocument): CommentView => {
   return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt.toISOString(),
   }
}
