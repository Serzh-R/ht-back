import request from 'supertest'
import { Express } from 'express'
import { SETTINGS, HTTP_STATUSES } from '../../src/core/settings'
import { correctPostData } from './test-data'
import { generateBasicAuthToken } from './generate-basic-auth-token'
import { PostView } from '../../src/posts/posts.types'

export async function createTestPost(
   app: Express,
   blogId: string,
   postData = correctPostData,
): Promise<PostView> {
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
