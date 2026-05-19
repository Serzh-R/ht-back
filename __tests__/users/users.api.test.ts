import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { correctUserData } from '../helpers/test-data'
import { generateBasicAuthToken } from '../helpers/generate-basic-auth-token'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'

const app = createApp()

describe('Users API', () => {
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

   it('should return empty users array; GET /users', async () => {
      const response = await request(app)
         .get(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 0,
         page: 1,
         pageSize: 10,
         totalCount: 0,
         items: [],
      })
   })

   it('should create user; POST /users', async () => {
      const response = await request(app)
         .post(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .send(correctUserData)
         .expect(HTTP_STATUSES.CREATED_201)

      expect(response.body).toEqual({
         id: expect.any(String),
         login: correctUserData.login,
         email: correctUserData.email,
         createdAt: expect.any(String),
      })

      expect(response.body.password).toBeUndefined()
      expect(response.body.passwordHash).toBeUndefined()

      const usersListResponse = await request(app)
         .get(SETTINGS.PATH.USERS)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(usersListResponse.body.items).toHaveLength(1)
      expect(usersListResponse.body.items[0]).toEqual(response.body)
   })

   it('should return users with pagination and sorting; GET /users', async () => {
      await createTestUser(app, {
         login: 'user01',
         email: 'user01@mail.com',
         password: 'qwerty123',
      })
      await createTestUser(app, {
         login: 'user02',
         email: 'user02@mail.com',
         password: 'qwerty123',
      })
      await createTestUser(app, {
         login: 'user03',
         email: 'user03@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .get(SETTINGS.PATH.USERS)
         .query({
            sortBy: 'login',
            sortDirection: 'asc',
            pageNumber: 2,
            pageSize: 2,
         })
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 2,
         page: 2,
         pageSize: 2,
         totalCount: 3,
         items: [
            {
               id: expect.any(String),
               login: 'user03',
               email: 'user03@mail.com',
               createdAt: expect.any(String),
            },
         ],
      })
   })

   it('should return users by searchLoginTerm or searchEmailTerm; GET /users', async () => {
      await createTestUser(app, {
         login: 'alex',
         email: 'alex@mail.com',
         password: 'qwerty123',
      })
      await createTestUser(app, {
         login: 'bob',
         email: 'manager@company.com',
         password: 'qwerty123',
      })
      await createTestUser(app, {
         login: 'tom',
         email: 'tom@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .get(SETTINGS.PATH.USERS)
         .query({
            searchLoginTerm: 'al',
            searchEmailTerm: 'company',
            sortBy: 'login',
            sortDirection: 'asc',
         })
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         pagesCount: 1,
         page: 1,
         pageSize: 10,
         totalCount: 2,
         items: [
            {
               id: expect.any(String),
               login: 'alex',
               email: 'alex@mail.com',
               createdAt: expect.any(String),
            },
            {
               id: expect.any(String),
               login: 'bob',
               email: 'manager@company.com',
               createdAt: expect.any(String),
            },
         ],
      })
   })

   it('should delete user; DELETE /users/:id', async () => {
      const createdUser = await createTestUser(app)

      await request(app)
         .delete(`${SETTINGS.PATH.USERS}/${createdUser.id}`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

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

   it('should return 404 when deleting non-existing user; DELETE /users/:id', async () => {
      await request(app)
         .delete(`${SETTINGS.PATH.USERS}/507f1f77bcf86cd799439011`)
         .set('Authorization', adminToken)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })
})
