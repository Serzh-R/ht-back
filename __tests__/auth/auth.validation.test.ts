import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'

const app = createApp()

describe('Auth validation', () => {
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

   it('should not login user when incorrect body passed; POST /auth/login', async () => {
      const invalidDataSet1 = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: '',
            password: '',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet1.body.errorsMessages).toHaveLength(2)
      expect(invalidDataSet1.body.errorsMessages).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ field: 'loginOrEmail' }),
            expect.objectContaining({ field: 'password' }),
         ]),
      )

      const invalidDataSet2 = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: '   ',
            password: '   ',
         })
         .expect(HTTP_STATUSES.BAD_REQUEST_400)

      expect(invalidDataSet2.body.errorsMessages).toHaveLength(2)
      expect(invalidDataSet2.body.errorsMessages).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ field: 'loginOrEmail' }),
            expect.objectContaining({ field: 'password' }),
         ]),
      )
   })

   it('should return 401 instead of 400 when body is valid but credentials are wrong; POST /auth/login', async () => {
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
