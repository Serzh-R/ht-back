import request from 'supertest'
import { createApp } from '../src/app'
import { HTTP_STATUSES, SETTINGS } from '../src/core/settings'
import { clearDb } from './helpers/clear-db'
import { createTestBlog } from './helpers/create-test-blog'
import { correctBlogData } from './helpers/test-data'
import { generateBasicAuthToken } from './helpers/generate-basic-auth-token'
import { runDb, stopDb } from '../src/db/mongo.db'

const app = createApp()

describe('Blogs validation', () => {
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

  it('should not create blog without authorization; POST /blogs', async () => {
    await request(app)
      .post(SETTINGS.PATH.BLOGS)
      .send(correctBlogData)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('should not update blog without authorization; PUT /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .send({
        name: 'Updated blog',
        description: 'Updated description',
        websiteUrl: 'https://updatedblog.com',
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('should not delete blog without authorization; DELETE /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    await request(app)
      .delete(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('should not create blog when incorrect body passed; POST /blogs', async () => {
    const invalidDataSet1 = await request(app)
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', adminToken)
      .send({
        ...correctBlogData,
        name: '',
        description: '',
        websiteUrl: 'wrong-url',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(3)

    const invalidDataSet2 = await request(app)
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', adminToken)
      .send({
        ...correctBlogData,
        name: '   ',
        description: '   ',
        websiteUrl: 'abc',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(3)

    const blogsListResponse = await request(app)
      .get(SETTINGS.PATH.BLOGS)
      .expect(HTTP_STATUSES.OK_200)

    expect(blogsListResponse.body).toEqual([])
  })

  it('should not update blog when incorrect body passed; PUT /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    const invalidDataSet1 = await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .set('Authorization', adminToken)
      .send({
        ...correctBlogData,
        name: '',
        description: '',
        websiteUrl: 'wrong-url',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(3)

    const invalidDataSet2 = await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .set('Authorization', adminToken)
      .send({
        ...correctBlogData,
        name: '   ',
        description: '   ',
        websiteUrl: 'abc',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(3)

    const blogResponse = await request(app)
      .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(blogResponse.body).toEqual(createdBlog)
  })

  it('should return 404 when updating non-existing blog with correct body; PUT /blogs/:id', async () => {
    await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/507f1f77bcf86cd799439011`)
      .set('Authorization', adminToken)
      .send({
        name: 'Updated blog',
        description: 'Updated description',
        websiteUrl: 'https://updatedblog.com',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should return 404 when deleting non-existing blog with authorization; DELETE /blogs/:id', async () => {
    await request(app)
      .delete(`${SETTINGS.PATH.BLOGS}/507f1f77bcf86cd799439011`)
      .set('Authorization', adminToken)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })
})
