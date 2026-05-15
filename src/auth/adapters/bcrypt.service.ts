import bcrypt from 'bcrypt'
import { BCRYPT_SALT_ROUNDS } from '../../core/settings'

export const bcryptService = {
   async generateHash(password: string): Promise<string> {
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
      return bcrypt.hash(password, salt)
   },

   async checkPassword(password: string, passwordHash: string): Promise<boolean> {
      return bcrypt.compare(password, passwordHash)
   },
}
