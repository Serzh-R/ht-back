import { inject, injectable } from 'inversify'
import { CommentsRepository } from '../comments/comments.repository'
import { Result, ResultStatus } from '../core/result/result.types'
import { LikeModel } from './likes.model'
import { LikesRepository } from './likes.repository'
import { LikeInput, LikeStatus } from './likes.types'
import { UsersRepository } from '../users/users.repository'
import { PostsRepository } from '../posts/posts.repository'

@injectable()
export class LikesService {
   constructor(
      @inject(LikesRepository) private likesRepository: LikesRepository,
      @inject(CommentsRepository) private commentsRepository: CommentsRepository,
      @inject(UsersRepository) private usersRepository: UsersRepository,
      @inject(PostsRepository) private postsRepository: PostsRepository,
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

         const user = await this.usersRepository.findById(userId)

         if (!user) {
            return {
               status: ResultStatus.Unauthorized,
               extensions: [],
               data: null,
            }
         }

         const like = new LikeModel()

         like.createdAt = new Date()
         like.status = input.likeStatus
         like.authorId = userId
         like.authorLogin = user.login
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

   async updatePostLikeStatus(postId: string, userId: string, input: LikeInput): Promise<Result> {
      /*const post = await this.postsRepository.findById(postId)

      if (!post) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      const existingLike = await this.likesRepository.findByAuthorIdAndParentId(userId, postId)*/

      const [post, existingLike] = await Promise.all([
         this.postsRepository.findById(postId),
         this.likesRepository.findByAuthorIdAndParentId(userId, postId),
      ])

      if (!post) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      if (!existingLike) {
         if (input.likeStatus === LikeStatus.None) {
            return {
               status: ResultStatus.NoContent,
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

         const like = new LikeModel()

         like.createdAt = new Date()
         like.status = input.likeStatus
         like.authorId = userId
         like.authorLogin = user.login
         like.parentId = postId

         if (input.likeStatus === LikeStatus.Like) {
            post.likesCount += 1
         }

         if (input.likeStatus === LikeStatus.Dislike) {
            post.dislikesCount += 1
         }

         /*await this.likesRepository.save(like)
         await this.postsRepository.save(post)*/

         await Promise.all([this.likesRepository.save(like), this.postsRepository.save(post)])

         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      if (input.likeStatus === LikeStatus.None) {
         if (existingLike.status === LikeStatus.Like) {
            post.likesCount -= 1
         }

         if (existingLike.status === LikeStatus.Dislike) {
            post.dislikesCount -= 1
         }

         /*await this.likesRepository.delete(existingLike)
         await this.postsRepository.save(post)*/

         await Promise.all([
            this.likesRepository.delete(existingLike),
            this.postsRepository.save(post),
         ])

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
         post.likesCount -= 1
         post.dislikesCount += 1
      }

      if (existingLike.status === LikeStatus.Dislike) {
         post.dislikesCount -= 1
         post.likesCount += 1
      }

      existingLike.status = input.likeStatus
      existingLike.createdAt = new Date()

      /*await this.likesRepository.save(existingLike)
      await this.postsRepository.save(post)*/

      await Promise.all([this.likesRepository.save(existingLike), this.postsRepository.save(post)])

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
