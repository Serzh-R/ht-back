import request from 'supertest'
import { createApp } from '../src/app'
import { HTTP_STATUSES, SETTINGS } from '../src/core/settings'
import { clearDb } from './helpers/clear-db'
import { createTestBlog } from './helpers/create-test-blog'
import { correctBlogData } from './helpers/test-data'
import { generateBasicAuthToken } from './helpers/generate-basic-auth-token'
import { runDb, stopDb } from '../src/db/mongo.db'
import { createTestPost } from './helpers/create-test-post'

const app = createApp()

describe('Blogs API', () => {
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

  it('should return empty blogs array; GET /blogs', async () => {
    const response = await request(app).get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUSES.OK_200)

    expect(response.body).toEqual([])
  })

  it('should create blog; POST /blogs', async () => {
    const response = await request(app)
      .post(SETTINGS.PATH.BLOGS)
      .set('Authorization', adminToken)
      .send(correctBlogData)
      .expect(HTTP_STATUSES.CREATED_201)

    expect(response.body).toEqual({
      id: expect.any(String),
      name: correctBlogData.name,
      description: correctBlogData.description,
      websiteUrl: correctBlogData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    })

    const blogsListResponse = await request(app)
      .get(SETTINGS.PATH.BLOGS)
      .expect(HTTP_STATUSES.OK_200)

    expect(blogsListResponse.body).toHaveLength(1)
    expect(blogsListResponse.body[0]).toEqual(response.body)
  })

  it('should return blog by id; GET /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    const response = await request(app)
      .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(response.body).toEqual(createdBlog)
  })

  it('should return 404 for non-existing blog; GET /blogs/:id', async () => {
    await request(app)
      .get(`${SETTINGS.PATH.BLOGS}/507f1f77bcf86cd799439011`)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should update blog; PUT /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    const updatedBlogData = {
      name: 'Updated blog',
      description: 'Updated description',
      websiteUrl: 'https://updatedblog.com',
    }

    await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .set('Authorization', adminToken)
      .send(updatedBlogData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const response = await request(app)
      .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(response.body).toEqual({
      id: createdBlog.id,
      name: updatedBlogData.name,
      description: updatedBlogData.description,
      websiteUrl: updatedBlogData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    })
  })

  it('should update blogName in all related posts when blog is updated', async () => {
    const createdBlog = await createTestBlog(app)

    const firstPost = await createTestPost(app, createdBlog.id, {
      title: 'Post 1',
      shortDescription: 'Short description 1',
      content: 'Content 1',
      blogId: '',
    })

    const secondPost = await createTestPost(app, createdBlog.id, {
      title: 'Post 2',
      shortDescription: 'Short description 2',
      content: 'Content 2',
      blogId: '',
    })

    const updatedBlogData = {
      name: 'Updated blog',
      description: 'Updated description',
      websiteUrl: 'https://updatedblog.com',
    }

    await request(app)
      .put(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .set('Authorization', adminToken)
      .send(updatedBlogData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const firstPostResponse = await request(app)
      .get(`${SETTINGS.PATH.POSTS}/${firstPost.id}`)
      .expect(HTTP_STATUSES.OK_200)

    const secondPostResponse = await request(app)
      .get(`${SETTINGS.PATH.POSTS}/${secondPost.id}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(firstPostResponse.body).toEqual({
      ...firstPost,
      blogName: updatedBlogData.name,
      createdAt: expect.any(String),
    })

    expect(secondPostResponse.body).toEqual({
      ...secondPost,
      blogName: updatedBlogData.name,
      createdAt: expect.any(String),
    })
  })

  it('should return 404 when updating non-existing blog; PUT /blogs/:id', async () => {
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

  it('should delete blog; DELETE /blogs/:id', async () => {
    const createdBlog = await createTestBlog(app)

    await request(app)
      .delete(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .set('Authorization', adminToken)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should return 404 when deleting non-existing blog; DELETE /blogs/:id', async () => {
    await request(app)
      .delete(`${SETTINGS.PATH.BLOGS}/507f1f77bcf86cd799439011`)
      .set('Authorization', adminToken)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })
})
