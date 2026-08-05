import request from 'supertest'
import { Express } from 'express'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { UserInput } from '../../src/users/users.types'
import { correctUserData } from './test-data'

export async function registerTestUser(
   app: Express,
   userData: UserInput = correctUserData,
   expectedStatus: number = HTTP_STATUSES.NO_CONTENT_204,
) {
   return request(app)
      .post(`${SETTINGS.PATH.AUTH}/registration`)
      .send(userData)
      .expect(expectedStatus)
}
