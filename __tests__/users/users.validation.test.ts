import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { correctUserData } from '../helpers/test-data'
import { generateBasicAuthToken } from '../helpers/generate-basic-auth-token'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'

const app = createApp()

describe('Users validation', () => {
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

   it('should not return users without authorization; GET /users', async () => {
      await request(app).get(SETTINGS.PATH.USERS).expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not create user without authorization; POST /users', async () => {
      await request(app)
         .post(SETTINGS.PATH.USERS)
         .send(correctUserData)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not delete user without authorization; DELETE /users/:id', async () => {
      const createdUser = await createTestUser(app)

      await request(app)
         .delete(`${SETTINGS.PATH.USERS}/${createdUser.id}`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should not create user when incorrect body passed; POST /users', async () => {
      const invalidDataSet1 = await request(app)
         .post(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .send({
            login: 'ab',
            password: '12345',
            email: 'wrong-email',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet1.body.errorsMessages).toHaveLength(3)
      expect(invalidDataSet1.body.errorsMessages).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ field: 'login' }),
            expect.objectContaining({ field: 'password' }),
            expect.objectContaining({ field: 'email' }),
         ]),
      )

      const invalidDataSet2 = await request(app)
         .post(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .send({
            login: 'invalid login',
            password: 'qwerty123',
            email: 'test-user@mail.com',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet2.body.errorsMessages).toHaveLength(1)
      expect(invalidDataSet2.body.errorsMessages[0].field).toBe('login')

      const usersListResponse = await request(app)
         .get(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(usersListResponse.body).toEqual({
         pagesCount: 0,
         page: 1,
         pageSize: 10,
         totalCount: 0,
         items: [],
      })
   })

   it('should not create user with duplicated login; POST /users', async () => {
      await createTestUser(app, {
         login: 'sameLogin',
         email: 'first@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .post(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .send({
            login: 'sameLogin',
            email: 'second@mail.com',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               field: 'login',
               message: expect.any(String),
            },
         ],
      })
   })

   it('should not create user with duplicated email; POST /users', async () => {
      await createTestUser(app, {
         login: 'firstUser',
         email: 'same-email@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .post(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .send({
            login: 'secondUser',
            email: 'same-email@mail.com',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               field: 'email',
               message: expect.any(String),
            },
         ],
      })
   })

   it('should return 404 when deleting non-existing user with authorization; DELETE /users/:id', async () => {
      await request(app)
         .delete(`${SETTINGS.PATH.USERS}/507f1f77bcf86cd799439011`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })
})
