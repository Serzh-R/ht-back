import { CommentView } from '../comments.types'
import { CommentDocument } from '../comments.model'
import { LikesInfoView } from '../../likes/likes.types'

export const mapperCommentView = (
   comment: CommentDocument,
   likesInfo: LikesInfoView,
): CommentView => {
   return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt.toISOString(),
      likesInfo,
   }
}
