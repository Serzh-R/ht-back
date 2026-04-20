import request from 'supertest'
import { app } from '../src/app'
import { HTTP_STATUSES, SETTINGS } from '../src/settings'
import { clearDb } from './helpers/clear-db'
import { createTestBlog } from './helpers/create-test-blog'
import { correctBlogData } from './helpers/test-data'
import {generateBasicAuthToken} from "./helpers/generate-basic-auth-token";


describe('Blogs API', () => {
    const adminToken = generateBasicAuthToken()

    beforeEach(async () => {
        await clearDb(app)
    })

    it('should return empty blogs array; GET /blogs', async () => {
        const response = await request(app)
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.OK_200)

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
            .get(`${SETTINGS.PATH.BLOGS}/not-existing-id`)
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
        })
    })

    it('should return 404 when updating non-existing blog; PUT /blogs/:id', async () => {
        await request(app)
            .put(`${SETTINGS.PATH.BLOGS}/not-existing-id`)
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
            .delete(`${SETTINGS.PATH.BLOGS}/not-existing-id`)
            .set('Authorization', adminToken)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
})