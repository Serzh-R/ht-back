import request from 'supertest'

import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { clearDb } from '../helpers/clear-db'
import { createTestUser } from '../helpers/create-test-user'
import { createTestBlog } from '../helpers/create-test-blog'
import { createTestPost } from '../helpers/create-test-post'
import { loginTestUser } from '../helpers/login-test-user'
import { createTestComment } from '../helpers/create-test-comment'

const app = createApp()

describe('Comments API', () => {
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

   it('should create comment for post; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const response = await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is correct comment content',
         })
         .expect(HTTP_STATUSES.CREATED_201)

      expect(response.body).toEqual({
         id: expect.any(String),
         content: 'This is correct comment content',
         commentatorInfo: {
            userId: user.id,
            userLogin: user.login,
         },
         createdAt: expect.any(String),
      })
   })

   it('should update own comment; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is updated correct comment content',
         })
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const response = await request(app)
         .get(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         ...comment,
         content: 'This is updated correct comment content',
      })
   })

   it('should return comment by id; GET /comments/:id', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      const response = await request(app)
         .get(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual(comment)
   })

   it('should return comments for post; GET /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const firstComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is first correct comment content',
      })

      const secondComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is second correct comment content',
      })

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 1,
         page: 1,
         pageSize: 10,
         totalCount: 2,
         items: [secondComment, firstComment],
      })
   })

   it('should delete own comment; DELETE /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .delete(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      await request(app)
         .get(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should return comments for post with pagination; GET /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const firstComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is first correct comment content',
      })

      const secondComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is second correct comment content',
      })

      const thirdComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is third correct comment content',
      })

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .query({
            pageNumber: 2,
            pageSize: 2,
         })
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 2,
         page: 2,
         pageSize: 2,
         totalCount: 3,
         items: [firstComment],
      })
   })

   it('should return comments for post with sorting by createdAt asc; GET /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const firstComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is first correct comment content',
      })

      const secondComment = await createTestComment(app, post.id, bearerToken, {
         content: 'This is second correct comment content',
      })

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .query({
            sortBy: 'createdAt',
            sortDirection: 'asc',
         })
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 1,
         page: 1,
         pageSize: 10,
         totalCount: 2,
         items: [firstComment, secondComment],
      })
   })

   it('should return only comments for specified post; GET /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)

      const firstPost = await createTestPost(app, blog.id, {
         title: 'first post title',
         shortDescription: 'first post short description',
         content: 'first post content',
         blogId: blog.id,
      })

      const secondPost = await createTestPost(app, blog.id, {
         title: 'second post title',
         shortDescription: 'second post short description',
         content: 'second post content',
         blogId: blog.id,
      })

      const firstPostComment = await createTestComment(app, firstPost.id, bearerToken, {
         content: 'This is first post correct comment',
      })

      await createTestComment(app, secondPost.id, bearerToken, {
         content: 'This is second post correct comment',
      })

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${firstPost.id}/comments`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 1,
         page: 1,
         pageSize: 10,
         totalCount: 1,
         items: [firstPostComment],
      })
   })

   it('should return empty comments list for post without comments; GET /posts/:postId/comments', async () => {
      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 0,
         page: 1,
         pageSize: 10,
         totalCount: 0,
         items: [],
      })
   })

   it('should create comment and ignore extra fields; POST /posts/:postId/comments', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const response = await request(app)
         .post(`${SETTINGS.PATH.POSTS}/${post.id}/comments`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is correct comment content',
            extraField: 'extra value',
         })
         .expect(HTTP_STATUSES.CREATED_201)

      expect(response.body).toEqual({
         id: expect.any(String),
         content: 'This is correct comment content',
         commentatorInfo: {
            userId: user.id,
            userLogin: user.login,
         },
         createdAt: expect.any(String),
      })

      expect(response.body.extraField).toBeUndefined()
   })

   it('should update comment and ignore extra fields; PUT /comments/:commentId', async () => {
      const user = await createTestUser(app)
      const bearerToken = await loginTestUser(app, user.login, 'qwerty123')

      const blog = await createTestBlog(app)
      const post = await createTestPost(app, blog.id)

      const comment = await createTestComment(app, post.id, bearerToken)

      await request(app)
         .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .set('Authorization', bearerToken)
         .send({
            content: 'This is updated correct comment content',
            extraField: 'extra value',
         })
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const response = await request(app)
         .get(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         ...comment,
         content: 'This is updated correct comment content',
      })

      expect(response.body.extraField).toBeUndefined()
   })
})
