import request from 'supertest'
import { Express } from 'express'
import { SETTINGS, HTTP_STATUSES } from '../../src/core/settings'
import { correctUserData } from './test-data'
import { generateBasicAuthToken } from './generate-basic-auth-token'
import { UserInput, UserView } from '../../src/users/users.types'

export async function createTestUser(
   app: Express,
   userData: UserInput = correctUserData,
): Promise<UserView> {
   const adminToken = generateBasicAuthToken()

   const response = await request(app)
      .post(SETTINGS.PATH.USERS)
      .set('Authorization', adminToken)
      .send(userData)
      .expect(HTTP_STATUSES.CREATED_201)

   return response.body
}
