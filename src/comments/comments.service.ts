import { CommentInput, CommentView } from './comments.types'
import { Result, ResultStatus } from '../core/result/result.types'
import { CommentsRepository } from './comments.repository'
import { PostsQueryRepository } from '../posts/posts.query-repository'
import { UsersRepository } from '../users/users.repository'

export class CommentsService {
   constructor(
      protected commentsRepository: CommentsRepository,
      protected postsQueryRepository: PostsQueryRepository,
      protected usersRepository: UsersRepository,
   ) {}

   async createComment(
      input: CommentInput,
      postId: string,
      userId: string,
   ): Promise<Result<CommentView>> {
      const post = await this.postsQueryRepository.findById(postId)

      if (!post) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      const user = await this.usersRepository.findById(userId)

      if (!user) {
         return {
            status: ResultStatus.Unauthorized,
            extensions: [],
            data: null,
         }
      }

      const createdComment = await this.commentsRepository.create(input, postId, {
         userId,
         userLogin: user.login,
      })

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: createdComment,
      }
   }

   async updateComment(commentId: string, input: CommentInput, userId: string): Promise<Result> {
      const comment = await this.commentsRepository.findById(commentId)

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

      const isUpdated = await this.commentsRepository.update(commentId, input.content)

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
   }

   async deleteComment(commentId: string, userId: string): Promise<Result> {
      const comment = await this.commentsRepository.findById(commentId)

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

      const isDeleted = await this.commentsRepository.delete(commentId)

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
   }
}

/*async createComment(
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
   },*/
