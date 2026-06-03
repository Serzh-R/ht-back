import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'
import { loginTestUser } from '../helpers/login-test-user'
import { usersRepository } from '../../src/users/users.repository'
import { emailManager } from '../../src/email/email.manager'

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

   afterEach(() => {
      jest.restoreAllMocks()
   })

   it('should register user and confirm email; POST /auth/registration and POST /auth/registration-confirmation', async () => {
      const sendEmailMock = jest
         .spyOn(emailManager, 'sendEmailConfirmationMessage')
         .mockResolvedValue(undefined)

      const userData = {
         login: 'newUser',
         email: 'new-user@mail.com',
         password: 'qwerty123',
      }

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration`)
         .send(userData)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      expect(sendEmailMock).toHaveBeenCalledTimes(1)

      const createdUser = await usersRepository.findByEmail(userData.email)

      expect(createdUser).not.toBeNull()
      expect(createdUser!.emailConfirmation.isConfirmed).toBe(false)

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: createdUser!.emailConfirmation.confirmationCode,
         })
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const confirmedUser = await usersRepository.findByEmail(userData.email)

      expect(confirmedUser).not.toBeNull()
      expect(confirmedUser!.emailConfirmation.isConfirmed).toBe(true)
   })

   it('should login user by login; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'testUser',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.OK_200)
      expect(response.body).toEqual({
         accessToken: expect.any(String),
      })
   })

   it('should login user by email; POST /auth/login', async () => {
      await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: 'test-user@mail.com',
            password: 'qwerty123',
         })
         .expect(HTTP_STATUSES.OK_200)
      expect(response.body).toEqual({
         accessToken: expect.any(String),
      })
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

   it('should return current user info; GET /auth/me', async () => {
      const user = await createTestUser(app, {
         login: 'testUser',
         email: 'test-user@mail.com',
         password: 'qwerty123',
      })

      const bearerToken = await loginTestUser(app, 'testUser', 'qwerty123')

      const response = await request(app)
         .get(`${SETTINGS.PATH.AUTH}/me`)
         .set('Authorization', bearerToken)
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         email: user.email,
         login: user.login,
         userId: user.id,
      })
   })
})
