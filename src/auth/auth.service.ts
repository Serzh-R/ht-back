import { Result, ResultStatus } from '../core/result/result.types'
import { usersRepository } from '../users/users.repository'
import { LoginInputModel } from './auth.types'
import { bcryptService } from './adapters/bcrypt.service'
import { UserInput, UserDb } from '../users/users.types'
import { emailManager } from '../email/email.manager'
import { createEmailConfirmation } from './helpers/create-email-confirmation'
import { RegConfirmCode } from './auth.types'
import { RegEmailResending } from './auth.types'

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

      if (!user.emailConfirmation.isConfirmed) {
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

   async registration(input: UserInput): Promise<Result> {
      const userByLogin = await usersRepository.findByLogin(input.login)

      if (userByLogin) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'login',
                  message: 'login should be unique',
               },
            ],
            data: null,
         }
      }

      const userByEmail = await usersRepository.findByEmail(input.email)

      if (userByEmail) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'email',
                  message: 'email should be unique',
               },
            ],
            data: null,
         }
      }

      const passwordHash = await bcryptService.generateHash(input.password)

      const newUser: UserDb = {
         login: input.login,
         email: input.email,
         passwordHash,
         createdAt: new Date(),
         emailConfirmation: createEmailConfirmation(),
      }

      await usersRepository.create(newUser)

      await emailManager.sendEmailConfirmationMessage(newUser)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },

   async registrationConfirmation(input: RegConfirmCode): Promise<Result> {
      const user = await usersRepository.findByConfirmationCode(input.code)

      if (!user) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'code',
                  message: 'Invalid confirmation code',
               },
            ],
            data: null,
         }
      }

      if (user.emailConfirmation.isConfirmed) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'code',
                  message: 'Email already confirmed',
               },
            ],
            data: null,
         }
      }

      if (user.emailConfirmation.expirationDate < new Date()) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'code',
                  message: 'Confirmation code expired',
               },
            ],
            data: null,
         }
      }

      await usersRepository.confirmEmail(user._id!.toString())

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },

   async registrationEmailResending(input: RegEmailResending): Promise<Result> {
      const user = await usersRepository.findByEmail(input.email)

      if (!user) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'email',
                  message: 'User not found',
               },
            ],
            data: null,
         }
      }

      if (user.emailConfirmation.isConfirmed) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'email',
                  message: 'Email already confirmed',
               },
            ],
            data: null,
         }
      }

      const newConfirmation = createEmailConfirmation()

      await usersRepository.updateConfirmationInfo(
         user._id!.toString(),
         newConfirmation.confirmationCode,
         newConfirmation.expirationDate,
      )

      user.emailConfirmation = newConfirmation

      await emailManager.sendEmailConfirmationMessage(user)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },
}
