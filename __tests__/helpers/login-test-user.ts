import request from 'supertest'
import { Express } from 'express'

import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'

export async function loginTestUser(
   app: Express,
   loginOrEmail: string,
   password: string,
): Promise<string> {
   const response = await request(app)
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({
         loginOrEmail,
         password,
      })
      .expect(HTTP_STATUSES.OK_200)

   return `Bearer ${response.body.accessToken}`
}
