import { Result, ResultStatus } from '../core/result/result.types'
import { UsersRepository } from '../users/users.repository'
import {
   LoginInputModel,
   NewPasswordRecoveryInputModel,
   PasswordRecoveryInputModel,
} from './auth.types'
import { UserInput, UserDb } from '../users/users.types'
import { EmailManager } from '../email/email.manager'
import { createEmailConfirmation } from './helpers/create-email-confirmation'
import { RegConfirmCode } from './auth.types'
import { RegEmailResending } from './auth.types'
import { BcryptService } from './adapters/bcrypt.service'
import { createPasswordRecovery } from './helpers/create-password-recovery'
import { inject, injectable } from 'inversify'
import { UserDocument } from '../users/users.model'

@injectable()
export class AuthService {
   constructor(
      @inject(UsersRepository) private usersRepository: UsersRepository,
      @inject(BcryptService) private bcryptService: BcryptService,
      @inject(EmailManager) private emailManager: EmailManager,
   ) {}

   async checkCredentials(input: LoginInputModel): Promise<Result<UserDocument>> {
      const user = await this.usersRepository.findByLoginOrEmail(input.loginOrEmail)

      if (!user) {
         return {
            status: ResultStatus.Unauthorized,
            extensions: [],
            data: null,
         }
      }

      const isPasswordCorrect = await this.bcryptService.checkPassword(
         input.password,
         user.passwordHash,
      )

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
   }

   async registration(input: UserInput): Promise<Result> {
      const userByLogin = await this.usersRepository.findByLogin(input.login)

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

      const userByEmail = await this.usersRepository.findByEmail(input.email)

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

      const passwordHash = await this.bcryptService.generateHash(input.password)

      const newUser: UserDb = {
         login: input.login,
         email: input.email,
         passwordHash,
         createdAt: new Date(),
         emailConfirmation: createEmailConfirmation(),
      }

      await this.usersRepository.create(newUser)

      this.emailManager.sendEmailConfirmationMessage(newUser).catch((e) => {
         console.error(`Failed to send confirmation email to ${newUser.email}`, e)
      })

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }

   async registrationConfirmation(input: RegConfirmCode): Promise<Result> {
      const user = await this.usersRepository.findByConfirmationCode(input.code)

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

      await this.usersRepository.confirmEmail(user._id!.toString())

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }

   async registrationEmailResending(input: RegEmailResending): Promise<Result> {
      const user = await this.usersRepository.findByEmail(input.email)

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

      await this.usersRepository.updateConfirmationInfo(
         user._id!.toString(),
         newConfirmation.confirmationCode,
         newConfirmation.expirationDate,
      )

      user.emailConfirmation = newConfirmation

      await this.emailManager.sendEmailConfirmationMessage(user)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }

   async passwordRecovery(input: PasswordRecoveryInputModel): Promise<Result> {
      const user = await this.usersRepository.findByEmail(input.email)

      if (!user || !user._id) {
         return {
            status: ResultStatus.NoContent,
            extensions: [],
            data: null,
         }
      }

      const passwordRecovery = createPasswordRecovery()

      await this.usersRepository.updatePasswordRecoveryInfo(
         user._id.toString(),
         passwordRecovery.recoveryCode,
         passwordRecovery.expirationDate,
      )

      this.emailManager
         .sendPasswordRecoveryMessage(user.email, passwordRecovery.recoveryCode)
         .catch((error) => {
            console.error(`Failed to send password recovery email to ${user.email}`, error)
         })

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }

   async newPassword(input: NewPasswordRecoveryInputModel): Promise<Result> {
      const user = await this.usersRepository.findByRecoveryCode(input.recoveryCode)

      if (!user || !user._id || !user.passwordRecovery) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'recoveryCode',
                  message: 'Recovery code is incorrect',
               },
            ],
            data: null,
         }
      }

      if (user.passwordRecovery.expirationDate < new Date()) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'recoveryCode',
                  message: 'Recovery code is expired',
               },
            ],
            data: null,
         }
      }

      const passwordHash = await this.bcryptService.generateHash(input.newPassword)

      const isPasswordUpdated = await this.usersRepository.updatePasswordHash(
         user._id.toString(),
         passwordHash,
      )

      if (!isPasswordUpdated) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'recoveryCode',
                  message: 'Recovery code is incorrect',
               },
            ],
            data: null,
         }
      }

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
