import request from 'supertest'

import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { runDb, stopDb } from '../../src/db/mongo.db'

import { clearDb } from '../helpers/clear-db'
import { createTestBlog } from '../helpers/create-test-blog'
import { createTestPost } from '../helpers/create-test-post'
import { createTestUser } from '../helpers/create-test-user'
import { loginTestUser } from '../helpers/login-test-user'
import { createTestComment } from '../helpers/create-test-comment'

const app = createApp()

describe('Comments validation', () => {
   beforeAll(async () => {
      await runDb(SETTINGS.MONGO_URL)
      await clearDb(app)
   })

   afterAll(async () => {
      await stopDb()
   })

   beforeEach(async () => {
      await clearDb(app)
   })

   it('should not create comment without Bearer token; POST /posts/:postId/comments', async () => {
      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .send({
            content: 'This is correct comment content',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not create comment with incorrect Bearer token; POST /posts/:postId/comments', async () => {
      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', 'Bearer incorrect-token')
         .send({
            content: 'This is correct comment content',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not create comment if post does not exist; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/666666666666666666666666/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is correct comment content',
         })
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not create comment with too short content; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 'short',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not create comment with too long content; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 'a'.repeat(301),
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update comment without Bearer token; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .send({
            content: 'This is updated correct comment content',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not update comment with incorrect Bearer token; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', 'Bearer incorrect-token')
         .send({
            content: 'This is updated correct comment content',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not update comment if comment does not exist; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is updated correct comment content',
         })
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not update comment with too short content; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({
            content: 'short',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update comment with too long content; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({
            content: 'a'.repeat(301),
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update comment if user is not owner; PUT /comments/:commentId', async () => {
      const firstUser = await createTestUser(app, {
         login: 'firstUser',
         email: 'first-user@mail.com',
         password: 'qwerty123',
      })

      const secondUser = await createTestUser(app, {
         login: 'secondUser',
         email: 'second-user@mail.com',
         password: 'qwerty123',
      })

      const firstUserBearerToken = await loginTestUser(app, firstUser.login, 'qwerty123')
      const secondUserBearerToken = await loginTestUser(app, secondUser.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, firstUserBearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', secondUserBearerToken)
         .send({
            content: 'This is updated correct comment content',
         })
         .expect(HTTP_STATUSES.FORBIDDEN_403)
   })

   it('should not delete comment without Bearer token; DELETE /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .delete(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not delete comment with incorrect Bearer token; DELETE /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .delete(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', 'Bearer incorrect-token')
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not delete comment if comment does not exist; DELETE /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      await request(app)
         .delete(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666`)
         .set('Authorization', bearerToken)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not delete comment if user is not owner; DELETE /comments/:commentId', async () => {
      const firstUser = await createTestUser(app, {
         login: 'firstUser',
         email: 'first-user@mail.com',
         password: 'qwerty123',
      })

      const secondUser = await createTestUser(app, {
         login: 'secondUser',
         email: 'second-user@mail.com',
         password: 'qwerty123',
      })

      const firstUserBearerToken = await loginTestUser(app, firstUser.login, 'qwerty123')
      const secondUserBearerToken = await loginTestUser(app, secondUser.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, firstUserBearerToken)

      await request(app)
         .delete(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', secondUserBearerToken)
         .expect(HTTP_STATUSES.FORBIDDEN_403)
   })

   it('should not return comment if comment does not exist; GET /comments/:id', async () => {
      await request(app)
         .get(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666`)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not return comments if post does not exist; GET /posts/:postId/comments', async () => {
      await request(app)
         .get(`${SETTINGS.PATH.POSTS}/666666666666666666666666/comments`)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not create comment without content; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({})
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update comment without content; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({})
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not create comment if content is not string; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 123,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update comment if content is not string; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({
            content: 123,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)
   })

   it('should not update like status without Bearer token; PUT /comments/:commentId/like-status', async () => {
      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666/like-status`)
         .send({
            likeStatus: 'Like',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not update like status with incorrect Bearer token; PUT /comments/:commentId/like-status', async () => {
      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666/like-status`)
         .set('Authorization', 'Bearer incorrect-token')
         .send({
            likeStatus: 'Like',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not update like status if comment does not exist; PUT /comments/:commentId/like-status', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/666666666666666666666666/like-status`)
         .set('Authorization', bearerToken)
         .send({
            likeStatus: 'Like',
         })
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should not update like status with incorrect value; PUT /comments/:commentId/like-status', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)
      const comment = await createTestComment(app, post.id, bearerToken)

      const response = await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}/like-status`)
         .set('Authorization', bearerToken)
         .send({
            likeStatus: 'IncorrectStatus',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: 'likeStatus must be None, Like or Dislike',
               field: 'likeStatus',
            },
         ],
      })
   })

   it('should not update like status without likeStatus field; PUT /comments/:commentId/like-status', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)
      const comment = await createTestComment(app, post.id, bearerToken)

      const response = await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}/like-status`)
         .set('Authorization', bearerToken)
         .send({})
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: 'likeStatus must be a string',
               field: 'likeStatus',
            },
         ],
      })
   })

   it('should not update like status if likeStatus is not string; PUT /comments/:commentId/like-status', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)
      const comment = await createTestComment(app, post.id, bearerToken)

      const response = await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}/like-status`)
         .set('Authorization', bearerToken)
         .send({
            likeStatus: 123,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: 'likeStatus must be a string',
               field: 'likeStatus',
            },
         ],
      })
   })
})
