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

   it('should not register user with empty login, email and password; POST /auth/registration', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/registration`).send({
         login: '',
         email: '',
         password: '',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: expect.arrayContaining([
            {
               message: expect.any(String),
               field: 'login',
            },
            {
               message: expect.any(String),
               field: 'email',
            },
            {
               message: expect.any(String),
               field: 'password',
            },
         ]),
      })
   })

   it('should not register user with too short login and password; POST /auth/registration', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/registration`).send({
         login: 'ab',
         email: 'test@mail.com',
         password: '12345',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: expect.arrayContaining([
            {
               message: expect.any(String),
               field: 'login',
            },
            {
               message: expect.any(String),
               field: 'password',
            },
         ]),
      })
   })

   it('should not register user with too long login and password; POST /auth/registration', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/registration`).send({
         login: '12345678901',
         email: 'test@mail.com',
         password: '123456789012345678901',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: expect.arrayContaining([
            {
               message: expect.any(String),
               field: 'login',
            },
            {
               message: expect.any(String),
               field: 'password',
            },
         ]),
      })
   })

   it('should not register user with invalid login pattern; POST /auth/registration', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/registration`).send({
         login: 'user@',
         email: 'test@mail.com',
         password: 'qwerty123',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'login',
            },
         ],
      })
   })

   it('should not register user with invalid email; POST /auth/registration', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/registration`).send({
         login: 'validUser',
         email: 'invalid-email',
         password: 'qwerty123',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'email',
            },
         ],
      })
   })

   it('should not confirm email with empty code; POST /auth/registration-confirmation', async () => {
      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: '',
         })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'code',
            },
         ],
      })
   })

   it('should not confirm email with code containing only spaces; POST /auth/registration-confirmation', async () => {
      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: '   ',
         })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'code',
            },
         ],
      })
   })

   it('should not resend confirmation email with empty email; POST /auth/registration-email-resending', async () => {
      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
         .send({
            email: '',
         })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'email',
            },
         ],
      })
   })

   it('should not resend confirmation email with invalid email; POST /auth/registration-email-resending', async () => {
      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
         .send({
            email: 'invalid-email',
         })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'email',
            },
         ],
      })
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

   it('should not recover password with invalid email; POST /auth/password-recovery', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/password-recovery`).send({
         email: '222^gmail.com',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'email',
            },
         ],
      })
   })

   it('should not recover password with empty email; POST /auth/password-recovery', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/password-recovery`).send({
         email: '',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'email',
            },
         ],
      })
   })

   it('should not set too short new password; POST /auth/new-password', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/new-password`).send({
         newPassword: '12345',
         recoveryCode: 'some-recovery-code',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'newPassword',
            },
         ],
      })
   })

   it('should not set too long new password; POST /auth/new-password', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/new-password`).send({
         newPassword: '123456789012345678901',
         recoveryCode: 'some-recovery-code',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'newPassword',
            },
         ],
      })
   })

   it('should not set new password with empty recovery code; POST /auth/new-password', async () => {
      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/new-password`).send({
         newPassword: 'newPassword123',
         recoveryCode: '',
      })

      expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(response.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'recoveryCode',
            },
         ],
      })
   })

   it('should return 401 without Bearer token; GET /auth/me', async () => {
      await request(app).get(`${SETTINGS.PATH.AUTH}/me`).expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should return 401 with incorrect Bearer token; GET /auth/me', async () => {
      await request(app)
         .get(`${SETTINGS.PATH.AUTH}/me`)
         .set('Authorization', 'Bearer incorrect-token')
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })
})
