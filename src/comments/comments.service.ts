import { CommentInput, CommentView } from './comments.types'
import { Result, ResultStatus } from '../core/result/result.types'
import { CommentsRepository } from './comments.repository'
import { PostsQueryRepository } from '../posts/posts.query-repository'
import { UsersRepository } from '../users/users.repository'
import { inject, injectable } from 'inversify'
import { CommentModel } from './comments.model'
import { mapperCommentView } from './mappers/mapper-comment.view'

@injectable()
export class CommentsService {
   constructor(
      @inject(CommentsRepository) private commentsRepository: CommentsRepository,
      @inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
      @inject(UsersRepository) private usersRepository: UsersRepository,
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

      const comment = new CommentModel()

      comment.content = input.content
      comment.commentatorInfo = {
         userId,
         userLogin: user.login,
      }
      comment.postId = postId
      comment.createdAt = new Date()

      await this.commentsRepository.save(comment)

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: mapperCommentView(comment),
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

      comment.content = input.content

      await this.commentsRepository.save(comment)

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

      await this.commentsRepository.delete(comment)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
