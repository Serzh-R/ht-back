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

describe('Posts API', () => {
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

   it('should return empty posts array; GET /posts', async () => {
      const response = await request(app).get(SETTINGS.PATH.POSTS).expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 0,
         page: 1,
         pageSize: 10,
         totalCount: 0,
         items: [],
      })
   })

   it('should create post; POST /posts', async () => {
      const createdBlog = await createTestBlog(app)

      const response = await request(app)
         .post(SETTINGS.PATH.POSTS)
         .set('Authorization', adminToken)
         .send({
            ...correctPostData,
            blogId: createdBlog.id,
         })
         .expect(HTTP_STATUSES.CREATED_201)

      expect(response.body).toEqual({
         id: expect.any(String),
         title: correctPostData.title,
         shortDescription: correctPostData.shortDescription,
         content: correctPostData.content,
         blogId: createdBlog.id,
         blogName: createdBlog.name,
         createdAt: expect.any(String),
      })

      const postsListResponse = await request(app)
         .get(SETTINGS.PATH.POSTS)
         .expect(HTTP_STATUSES.OK_200)

      expect(postsListResponse.body.items).toHaveLength(1)
      expect(postsListResponse.body.items[0]).toEqual(response.body)
   })

   it('should return post by id; GET /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)
      const createdPost = await createTestPost(app, createdBlog.id)

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual(createdPost)
   })

   it('should return 404 for non-existing post; GET /posts/:id', async () => {
      await request(app)
         .get(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should update post; PUT /posts/:id', async () => {
      const createdBlog = await createTestBlog(app, {
         name: 'Blog 1',
         description: 'Description 1',
         websiteUrl: 'https://blog1.com',
      })

      const anotherBlog = await createTestBlog(app, {
         name: 'Blog 2',
         description: 'Description 2',
         websiteUrl: 'https://blog2.com',
      })

      const createdPost = await createTestPost(app, createdBlog.id)

      const updatedPostData = {
         title: 'Updated title',
         shortDescription: 'Updated short description',
         content: 'Updated content',
         blogId: anotherBlog.id,
      }

      await request(app)
         .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .set('Authorization', adminToken)
         .send(updatedPostData)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const response = await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         id: createdPost.id,
         title: updatedPostData.title,
         shortDescription: updatedPostData.shortDescription,
         content: updatedPostData.content,
         blogId: anotherBlog.id,
         blogName: anotherBlog.name,
         createdAt: expect.any(String),
      })
   })

   it('should return 404 when updating non-existing post; PUT /posts/:id', async () => {
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

   it('should delete post; DELETE /posts/:id', async () => {
      const createdBlog = await createTestBlog(app)
      const createdPost = await createTestPost(app, createdBlog.id)

      await request(app)
         .delete(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      await request(app)
         .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should return 404 when deleting non-existing post; DELETE /posts/:id', async () => {
      await request(app)
         .delete(`${SETTINGS.PATH.POSTS}/507f1f77bcf86cd799439011`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })
})
