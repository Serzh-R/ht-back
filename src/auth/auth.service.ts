import { Result, ResultStatus } from '../core/result/result.types'
import { usersRepository } from '../users/users.repository'
import { LoginInputModel } from './auth.types'
import { bcryptService } from './adapters/bcrypt.service'
import { UserDb } from '../users/users.types'

export const authService = {
   async checkCredentials(input: LoginInputModel): Promise<Result<UserDb>> {
      const user = await usersRepository.findByLoginOrEmail(input.loginOrEmail)

      if (!user) {
         return {
            status: ResultStatus.Unauthorized,
            extensions: [],
            data: null,
         }
      }

      const isPasswordCorrect = await bcryptService.checkPassword(input.password, user.passwordHash)

      if (!isPasswordCorrect) {
         return {
            status: ResultStatus.Unauthorized,
            extensions: [],
            data: null,
         }
      }

      return {
         status: ResultStatus.Success,
         extensions: [],
         data: user,
      }
   },
}
