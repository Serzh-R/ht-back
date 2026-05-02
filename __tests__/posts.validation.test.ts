import request from 'supertest'
import { createApp } from '../src/app'
import { HTTP_STATUSES, SETTINGS } from '../src/core/settings'
import { clearDb } from './helpers/clear-db'
import { createTestBlog } from './helpers/create-test-blog'
import { createTestPost } from './helpers/create-test-post'
import { correctPostData } from './helpers/test-data'
import { generateBasicAuthToken } from './helpers/generate-basic-auth-token'
import { runDb, stopDb } from '../src/db/mongo.db'

const app = createApp()

describe('Posts validation', () => {
   const adminToken = generateBasicAuthToken()

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

   it('should not create post without authorization; POST /posts', async () => {
      const createdBlog = await createTestBlog(app)

      await request(app)
         .post(SETTINGS.PATH.POSTS)
         .send({
            ...correctPostData,
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not update post without authorization; PUT /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)
      const createdPost = await createTestPost(app, createdBlog.id)

      await request(app)
         .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .send({
            ...correctPostData,
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not delete post without authorization; DELETE /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)
      const createdPost = await createTestPost(app, createdBlog.id)

      await request(app)
         .delete(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not create post when incorrect body passed; POST /posts', async () => {
      const createdBlog = await createTestBlog(app)

      const invalidDataSet1 = await request(app)
         .post(SETTINGS.PATH.POSTS)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            title: '',
            shortDescription: '',
            content: '',
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet1.body.errorsMessages).toHaveLength(3)

      const invalidDataSet2 = await request(app)
         .post(SETTINGS.PATH.POSTS)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            title: '   ',
            shortDescription: '   ',
            content: '   ',
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet2.body.errorsMessages).toHaveLength(3)

      const invalidDataSet3 = await request(app)
         .post(SETTINGS.PATH.POSTS)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            blogId: '507f1f77bcf86cd799439011',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet3.body.errorsMessages).toHaveLength(1)
      expect(invalidDataSet3.body.errorsMessages[0].field).toBe('blogId')

      const postsListResponse = await request(app)
         .get(SETTINGS.PATH.POSTS)
         .expect(HTTP_STATUSES.OK_200)

      expect(postsListResponse.body).toEqual([])
   })

   it('should not update post when incorrect body passed; PUT /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)
      const createdPost = await createTestPost(app, createdBlog.id)

      const invalidDataSet1 = await request(app)
         .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            title: '',
            shortDescription: '',
            content: '',
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet1.body.errorsMessages).toHaveLength(3)

      const invalidDataSet2 = await request(app)
         .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            title: '   ',
            shortDescription: '   ',
            content: '   ',
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet2.body.errorsMessages).toHaveLength(3)

      const invalidDataSet3 = await request(app)
         .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            blogId: '507f1f77bcf86cd799439011',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet3.body.errorsMessages).toHaveLength(1)
      expect(invalidDataSet3.body.errorsMessages[0].field).toBe('blogId')

      const postResponse = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(postResponse.body).toEqual(createdPost)
   })

   it('should return 404 when updating non-existing post with correct body; PUT /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)

      await request(app)
         .put(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should return 404 when deleting non-existing post with authorization; DELETE /posts/:id', async () => {
      await request(app)
         .delete(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })
})
