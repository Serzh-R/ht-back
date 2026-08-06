import { randomUUID } from 'crypto'
import { PasswordRecoveryInfo } from '../../users/users.types'

export const createPasswordRecovery = (): PasswordRecoveryInfo => {
   return {
      recoveryCode: randomUUID(),
      expirationDate: new Date(Date.now() + 1000 * 60 * 60),
   }
}
