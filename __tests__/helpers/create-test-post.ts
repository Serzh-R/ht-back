import request from 'supertest'
import { Express } from 'express'
import { SETTINGS, HTTP_STATUSES } from '../../src/settings'
import { correctPostData } from './test-data'
import {generateBasicAuthToken} from "./generate-basic-auth-token";

export async function createTestPost(
    app: Express,
    blogId: string,
    postData: {
        title: string
        shortDescription: string
        content: string
    } = correctPostData,
) {
    const adminToken = generateBasicAuthToken()

    const response = await request(app)
        .post(SETTINGS.PATH.POSTS)
        .set('Authorization', adminToken)
        .send({
            ...postData,
            blogId,
        })
        .expect(HTTP_STATUSES.CREATED_201)

    return response.body
}