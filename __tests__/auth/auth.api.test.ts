import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'

const app = createApp()

describe('Auth API', () => {
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

   it('should login user by login; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'testUser',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.NO_CONTENT_204)
   })

   it('should login user by email; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'test-user@mail.com',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.NO_CONTENT_204)
   })

   it('should not login user with incorrect login or email; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'unknownUser',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not login user with incorrect password; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'testUser',
            password: 'wrongPassword',
         })
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })
})
