import request from 'supertest'
import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { clearDb } from '../helpers/clear-db'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { createTestUser } from '../helpers/create-test-user'
import { loginTestUser } from '../helpers/login-test-user'
import { usersRepository } from '../../src/users/users.repository'
import { emailManager } from '../../src/email/email.manager'
import { registerTestUser } from '../helpers/register-test-user'
import { correctUserData } from '../helpers/test-data'
import { confirmTestUserEmail } from '../helpers/confirm-test-user-email'

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

   it('should login user and return accessToken in body and refreshToken in cookie', async () => {
      const userData = {
         login: 'login01',
         password: 'password01',
         email: 'login01@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         accessToken: expect.any(String),
      })

      const cookies = response.headers['set-cookie']

      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain('refreshToken=')
      expect(cookies[0]).toContain('HttpOnly')
   })

   it('should refresh tokens and return new accessToken and refreshToken cookie', async () => {
      const userData = {
         login: 'login02',
         password: 'password02',
         email: 'login02@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const loginResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      const refreshCookie = loginResponse.headers['set-cookie']

      const refreshResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', refreshCookie)
         .expect(HTTP_STATUSES.OK_200)

      expect(refreshResponse.body).toEqual({
         accessToken: expect.any(String),
      })

      const newCookies = refreshResponse.headers['set-cookie']

      expect(newCookies).toBeDefined()
      expect(newCookies[0]).toContain('refreshToken=')
   })

   it('should not refresh tokens twice with the same refreshToken', async () => {
      const userData = {
         login: 'login03',
         password: 'password03',
         email: 'login03@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const loginResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      const oldRefreshCookie = loginResponse.headers['set-cookie']

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', oldRefreshCookie)
         .expect(HTTP_STATUSES.OK_200)

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', oldRefreshCookie)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should logout user by refreshToken in cookie', async () => {
      const userData = {
         login: 'login04',
         password: 'password04',
         email: 'login04@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const loginResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      const refreshCookie = loginResponse.headers['set-cookie']

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/logout`)
         .set('Cookie', refreshCookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)
   })

   it('should not refresh tokens after logout', async () => {
      const userData = {
         login: 'login05',
         password: 'password05',
         email: 'login05@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const loginResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      const refreshCookie = loginResponse.headers['set-cookie']

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/logout`)
         .set('Cookie', refreshCookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', refreshCookie)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should return 401 if refreshToken cookie is missing', async () => {
      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should return 401 for logout if refreshToken cookie is missing', async () => {
      await request(app).post(`${SETTINGS.PATH.AUTH}/logout`).expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should allow refresh tokens with new refreshToken cookie after rotation', async () => {
      const userData = {
         login: 'login08',
         password: 'password08',
         email: 'login08@gmail.com',
      }

      await registerTestUser(app, userData)
      await confirmTestUserEmail(app, userData.email)

      const loginResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/login`)
         .send({
            loginOrEmail: userData.login,
            password: userData.password,
         })
         .expect(HTTP_STATUSES.OK_200)

      const firstRefreshCookie = loginResponse.headers['set-cookie']

      const firstRefreshResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', firstRefreshCookie)
         .expect(HTTP_STATUSES.OK_200)

      const secondRefreshCookie = firstRefreshResponse.headers['set-cookie']

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', secondRefreshCookie)
         .expect(HTTP_STATUSES.OK_200)
   })

   it('should register user and confirm email; POST /auth/registration and POST /auth/registration-confirmation', async () => {
      const sendEmailMock = jest
         .spyOn(emailManager, 'sendEmailConfirmationMessage')
         .mockResolvedValue(undefined)

      const registrationResponse = await registerTestUser(app, correctUserData)

      expect(registrationResponse.status).toBe(HTTP_STATUSES.NO_CONTENT_204)

      expect(sendEmailMock).toHaveBeenCalledTimes(1)

      const createdUser = await usersRepository.findByEmail(correctUserData.email)

      expect(createdUser).not.toBeNull()
      expect(createdUser!.emailConfirmation.isConfirmed).toBe(false)

      const confirmationResponse = await confirmTestUserEmail(app, correctUserData.email)

      expect(confirmationResponse.status).toBe(HTTP_STATUSES.NO_CONTENT_204)

      const confirmedUser = await usersRepository.findByEmail(correctUserData.email)

      expect(confirmedUser).not.toBeNull()
      expect(confirmedUser!.emailConfirmation.isConfirmed).toBe(true)
   })

   it('should not register user with already existing email; POST /auth/registration', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      const secondUserData = {
         ...correctUserData,
         login: 'user2',
      }

      const response = await registerTestUser(app, secondUserData)

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

   it('should not register user with already existing login; POST /auth/registration', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      const secondUserData = {
         ...correctUserData,
         email: 'another-email@mail.com',
      }

      const response = await registerTestUser(app, secondUserData)

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

   it('should not confirm email with incorrect confirmation code; POST /auth/registration-confirmation', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: 'incorrect-confirmation-code',
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

   it('should not confirm email twice with the same confirmation code; POST /auth/registration-confirmation', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      const user = await usersRepository.findByEmail(correctUserData.email)

      expect(user).not.toBeNull()

      const confirmationCode = user!.emailConfirmation.confirmationCode

      const firstResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: confirmationCode,
         })

      expect(firstResponse.status).toBe(HTTP_STATUSES.NO_CONTENT_204)

      const secondResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
         .send({
            code: confirmationCode,
         })

      expect(secondResponse.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

      expect(secondResponse.body).toEqual({
         errorsMessages: [
            {
               message: expect.any(String),
               field: 'code',
            },
         ],
      })
   })

   it('should resend confirmation email for registered but not confirmed user; POST /auth/registration-email-resending', async () => {
      const sendEmailMock = jest
         .spyOn(emailManager, 'sendEmailConfirmationMessage')
         .mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      expect(sendEmailMock).toHaveBeenCalledTimes(1)

      const userBeforeResending = await usersRepository.findByEmail(correctUserData.email)

      expect(userBeforeResending).not.toBeNull()

      const oldConfirmationCode = userBeforeResending!.emailConfirmation.confirmationCode

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
         .send({
            email: correctUserData.email,
         })

      expect(response.status).toBe(HTTP_STATUSES.NO_CONTENT_204)

      expect(sendEmailMock).toHaveBeenCalledTimes(2)

      const userAfterResending = await usersRepository.findByEmail(correctUserData.email)

      expect(userAfterResending).not.toBeNull()

      expect(userAfterResending!.emailConfirmation.confirmationCode).not.toBe(oldConfirmationCode)
   })

   it('should not resend confirmation email if user is already confirmed; POST /auth/registration-email-resending', async () => {
      const sendEmailMock = jest
         .spyOn(emailManager, 'sendEmailConfirmationMessage')
         .mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      await confirmTestUserEmail(app, correctUserData.email)

      expect(sendEmailMock).toHaveBeenCalledTimes(1)

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
         .send({
            email: correctUserData.email,
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

      expect(sendEmailMock).toHaveBeenCalledTimes(1)
   })

   it('should not resend confirmation email for non-existing user; POST /auth/registration-email-resending', async () => {
      const sendEmailMock = jest
         .spyOn(emailManager, 'sendEmailConfirmationMessage')
         .mockResolvedValue(undefined)

      const response = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
         .send({
            email: 'not-exists@mail.com',
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

      expect(sendEmailMock).not.toHaveBeenCalled()
   })

   it('should not login user if email is not confirmed; POST /auth/login', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/login`).send({
         loginOrEmail: correctUserData.login,
         password: correctUserData.password,
      })

      expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should login user after email confirmation; POST /auth/login', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      await confirmTestUserEmail(app, correctUserData.email)

      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/login`).send({
         loginOrEmail: correctUserData.login,
         password: correctUserData.password,
      })

      expect(response.status).toBe(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         accessToken: expect.any(String),
      })
   })

   it('should login confirmed user by email; POST /auth/login', async () => {
      jest.spyOn(emailManager, 'sendEmailConfirmationMessage').mockResolvedValue(undefined)

      await registerTestUser(app, correctUserData)

      await confirmTestUserEmail(app, correctUserData.email)

      const response = await request(app).post(`${SETTINGS.PATH.AUTH}/login`).send({
         loginOrEmail: correctUserData.email,
         password: correctUserData.password,
      })

      expect(response.status).toBe(HTTP_STATUSES.OK_200)

      expect(response.body).toEqual({
         accessToken: expect.any(String),
      })
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
