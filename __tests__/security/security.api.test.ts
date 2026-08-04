import request from 'supertest'
import { Express } from 'express'
import { randomUUID } from 'crypto'

import { createApp } from '../../src/app'
import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { runDb, stopDb } from '../../src/db/mongo.db'
import { DeviceViewModel } from '../../src/security/security.types'
import { clearDb } from '../helpers/clear-db'
import { registerTestUser } from '../helpers/register-test-user'
import { confirmTestUserEmail } from '../helpers/confirm-test-user-email'

const app = createApp()

type TestUserData = {
   login: string
   email: string
   password: string
}

type DeviceLoginResult = {
   refreshCookie: string[]
}

const getRefreshCookie = (response: request.Response): string[] => {
   const cookies = response.headers['set-cookie']

   if (!cookies) {
      throw new Error('Refresh token cookie was not found')
   }

   return Array.isArray(cookies) ? cookies : [cookies]
}

const createAndConfirmUser = async (app: Express, userData: TestUserData): Promise<void> => {
   await registerTestUser(app, userData)
   await confirmTestUserEmail(app, userData.email)
}

const loginDevice = async (
   app: Express,
   userData: TestUserData,
   userAgent: string,
): Promise<DeviceLoginResult> => {
   const response = await request(app)
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .set('User-Agent', userAgent)
      .send({
         loginOrEmail: userData.login,
         password: userData.password,
      })
      .expect(HTTP_STATUSES.OK_200)

   return {
      refreshCookie: getRefreshCookie(response),
   }
}

const getDevices = async (app: Express, refreshCookie: string[]): Promise<DeviceViewModel[]> => {
   const response = await request(app)
      .get(`${SETTINGS.PATH.SECURITY}/devices`)
      .set('Cookie', refreshCookie)
      .expect(HTTP_STATUSES.OK_200)

   return response.body
}

const delay = async (milliseconds: number): Promise<void> => {
   await new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
   })
}

describe('Security devices API', () => {
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

   it('should manage active device sessions', async () => {
      const userData: TestUserData = {
         login: 'securityUser',
         email: 'security-user@mail.com',
         password: 'qwerty123',
      }

      await createAndConfirmUser(app, userData)

      const device1 = await loginDevice(app, userData, 'Chrome 105')

      const device2 = await loginDevice(app, userData, 'Firefox 104')

      const device3 = await loginDevice(app, userData, 'Safari 16')

      const device4 = await loginDevice(app, userData, 'Edge 105')

      const devicesBeforeRefresh = await getDevices(app, device1.refreshCookie)

      expect(devicesBeforeRefresh).toHaveLength(4)

      expect(devicesBeforeRefresh).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               title: 'Chrome 105',
            }),
            expect.objectContaining({
               title: 'Firefox 104',
            }),
            expect.objectContaining({
               title: 'Safari 16',
            }),
            expect.objectContaining({
               title: 'Edge 105',
            }),
         ]),
      )

      const firstDeviceBeforeRefresh = devicesBeforeRefresh.find(
         (device) => device.title === 'Chrome 105',
      )

      const secondDevice = devicesBeforeRefresh.find((device) => device.title === 'Firefox 104')

      const thirdDevice = devicesBeforeRefresh.find((device) => device.title === 'Safari 16')

      if (!firstDeviceBeforeRefresh || !secondDevice || !thirdDevice) {
         throw new Error('Required test devices were not found')
      }

      const deviceIdsBeforeRefresh = devicesBeforeRefresh.map((device) => device.deviceId).sort()

      await delay(1100)

      const refreshResponse = await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', device1.refreshCookie)
         .expect(HTTP_STATUSES.OK_200)

      const updatedDevice1Cookie = getRefreshCookie(refreshResponse)

      const devicesAfterRefresh = await getDevices(app, updatedDevice1Cookie)

      expect(devicesAfterRefresh).toHaveLength(4)

      const deviceIdsAfterRefresh = devicesAfterRefresh.map((device) => device.deviceId).sort()

      expect(deviceIdsAfterRefresh).toEqual(deviceIdsBeforeRefresh)

      const firstDeviceAfterRefresh = devicesAfterRefresh.find(
         (device) => device.deviceId === firstDeviceBeforeRefresh.deviceId,
      )

      if (!firstDeviceAfterRefresh) {
         throw new Error('First device was not found after refresh')
      }

      expect(firstDeviceAfterRefresh.lastActiveDate).not.toBe(
         firstDeviceBeforeRefresh.lastActiveDate,
      )

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices/${secondDevice.deviceId}`)
         .set('Cookie', updatedDevice1Cookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const devicesAfterSecondDeletion = await getDevices(app, updatedDevice1Cookie)

      expect(devicesAfterSecondDeletion).toHaveLength(3)

      expect(
         devicesAfterSecondDeletion.some((device) => device.deviceId === secondDevice.deviceId),
      ).toBe(false)

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/logout`)
         .set('Cookie', device3.refreshCookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const devicesAfterThirdLogout = await getDevices(app, updatedDevice1Cookie)

      expect(devicesAfterThirdLogout).toHaveLength(2)

      expect(
         devicesAfterThirdLogout.some((device) => device.deviceId === thirdDevice.deviceId),
      ).toBe(false)

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices`)
         .set('Cookie', updatedDevice1Cookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const finalDevices = await getDevices(app, updatedDevice1Cookie)

      expect(finalDevices).toHaveLength(1)

      expect(finalDevices[0].deviceId).toBe(firstDeviceBeforeRefresh.deviceId)

      expect(finalDevices[0].title).toBe('Chrome 105')

      void device2
      void device4
   })

   it('should return 401 if refresh token cookie is missing', async () => {
      await request(app)
         .get(`${SETTINGS.PATH.SECURITY}/devices`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices/${randomUUID()}`)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should return 404 if device session does not exist', async () => {
      const userData: TestUserData = {
         login: 'notFoundUser',
         email: 'not-found-user@mail.com',
         password: 'qwerty123',
      }

      await createAndConfirmUser(app, userData)

      const currentDevice = await loginDevice(app, userData, 'Chrome 105')

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices/${randomUUID()}`)
         .set('Cookie', currentDevice.refreshCookie)
         .expect(HTTP_STATUSES.NOT_FOUND_404)
   })

   it('should return 403 when deleting another user device', async () => {
      const firstUserData: TestUserData = {
         login: 'firstUser',
         email: 'first-user@mail.com',
         password: 'qwerty123',
      }

      const secondUserData: TestUserData = {
         login: 'secondUser',
         email: 'second-user@mail.com',
         password: 'qwerty123',
      }

      await createAndConfirmUser(app, firstUserData)

      await createAndConfirmUser(app, secondUserData)

      const firstUserDevice = await loginDevice(app, firstUserData, 'First user Chrome')

      const secondUserDevice = await loginDevice(app, secondUserData, 'Second user Firefox')

      const secondUserDevices = await getDevices(app, secondUserDevice.refreshCookie)

      expect(secondUserDevices).toHaveLength(1)

      const secondUserDeviceId = secondUserDevices[0].deviceId

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices/${secondUserDeviceId}`)
         .set('Cookie', firstUserDevice.refreshCookie)
         .expect(HTTP_STATUSES.FORBIDDEN_403)

      const devicesAfterFailedDeletion = await getDevices(app, secondUserDevice.refreshCookie)

      expect(devicesAfterFailedDeletion).toHaveLength(1)

      expect(devicesAfterFailedDeletion[0].deviceId).toBe(secondUserDeviceId)
   })

   it('should invalidate refresh token after device deletion', async () => {
      const userData: TestUserData = {
         login: 'deletedDeviceUser',
         email: 'deleted-device-user@mail.com',
         password: 'qwerty123',
      }

      await createAndConfirmUser(app, userData)

      const currentDevice = await loginDevice(app, userData, 'Current Chrome')

      const deviceForDeletion = await loginDevice(app, userData, 'Deleted Firefox')

      const devices = await getDevices(app, currentDevice.refreshCookie)

      const deletingDevice = devices.find((device) => device.title === 'Deleted Firefox')

      if (!deletingDevice) {
         throw new Error('Device for deletion was not found')
      }

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices/${deletingDevice.deviceId}`)
         .set('Cookie', currentDevice.refreshCookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      await request(app)
         .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
         .set('Cookie', deviceForDeletion.refreshCookie)
         .expect(HTTP_STATUSES.UNAUTHORIZED_401)
   })

   it('should keep current device when deleting all other sessions', async () => {
      const userData: TestUserData = {
         login: 'keepDeviceUser',
         email: 'keep-device-user@mail.com',
         password: 'qwerty123',
      }

      await createAndConfirmUser(app, userData)

      const currentDevice = await loginDevice(app, userData, 'Current device')

      await loginDevice(app, userData, 'Second device')

      await loginDevice(app, userData, 'Third device')

      await request(app)
         .delete(`${SETTINGS.PATH.SECURITY}/devices`)
         .set('Cookie', currentDevice.refreshCookie)
         .expect(HTTP_STATUSES.NO_CONTENT_204)

      const devices = await getDevices(app, currentDevice.refreshCookie)

      expect(devices).toHaveLength(1)

      expect(devices[0]).toEqual(
         expect.objectContaining({
            title: 'Current device',
            deviceId: expect.any(String),
            ip: expect.any(String),
            lastActiveDate: expect.any(String),
         }),
      )
   })
})
