import request from 'supertest'
import { Express } from 'express'
import { SETTINGS } from '../../src/core/settings'
import { usersRepository } from '../../src/composition-root'

export async function confirmTestUserEmail(app: Express, email: string) {
   const user = await usersRepository.findByEmail(email)

   if (!user) {
      throw new Error(`User with email ${email} was not found`)
   }

   return request(app).post(`${SETTINGS.PATH.AUTH}/registration-confirmation`).send({
      code: user.emailConfirmation.confirmationCode,
   })
}
