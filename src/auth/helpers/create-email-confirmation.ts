import { randomUUID } from 'crypto'
import { EmailConfirmationInfo } from '../../users/users.types'

export const createEmailConfirmation = (): EmailConfirmationInfo => {
   return {
      confirmationCode: randomUUID(),

      expirationDate: new Date(Date.now() + 1000 * 60 * 60),

      isConfirmed: false,
   }
}
