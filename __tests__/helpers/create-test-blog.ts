import request from 'supertest'
import { Express } from 'express'
import { SETTINGS, HTTP_STATUSES } from '../../src/settings'
import { correctBlogData } from './test-data'
import {generateBasicAuthToken} from "./generate-basic-auth-token";

export async function createTestBlog(
    app: Express,
    blogData: {
        name: string
        description: string
        websiteUrl: string
    } = correctBlogData,
) {
    const adminToken = generateBasicAuthToken()

    const response = await request(app)
        .post(SETTINGS.PATH.BLOGS)
        .set('Authorization', adminToken)
        .send(blogData)
        .expect(HTTP_STATUSES.CREATED_201)

    return response.body
}