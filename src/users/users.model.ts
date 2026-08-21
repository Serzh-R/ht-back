import { HydratedDocument, Model, model, Schema } from 'mongoose'
import { EmailConfirmationInfo, PasswordRecoveryInfo, UserDb, UserInput } from './users.types'

const emailConfirmationSchema = new Schema<EmailConfirmationInfo>(
   {
      confirmationCode: { type: String, required: false },
      expirationDate: { type: Date, required: true },
      isConfirmed: { type: Boolean, required: true },
   },
   {
      _id: false,
   },
)

const passwordRecoverySchema = new Schema<PasswordRecoveryInfo>(
   {
      recoveryCode: { type: String, required: true },
      expirationDate: { type: Date, required: true },
   },
   {
      _id: false,
   },
)

interface UserMethods {
   confirmEmail(): void

   updateEmailConfirmation(emailConfirmation: EmailConfirmationInfo): void

   setPasswordRecovery(passwordRecovery: PasswordRecoveryInfo): void

   updatePassword(passwordHash: string): void
}

type UserStatics = typeof UserEntity

type UserModelType = Model<UserDb, {}, UserMethods> & UserStatics

export type UserDocument = HydratedDocument<UserDb, UserMethods>

const userSchema = new Schema<UserDb>(
   {
      login: { type: String, required: true },
      email: { type: String, required: true },
      passwordHash: { type: String, required: true },
      createdAt: { type: Date, required: true },
      emailConfirmation: { type: emailConfirmationSchema, required: true },
      passwordRecovery: { type: passwordRecoverySchema, required: false },
   },
   {
      collection: 'users',
      versionKey: false,
   },
)

class UserEntity {
   private constructor(
      public login: string,
      public email: string,
      public passwordHash: string,
      public createdAt: Date,
      public emailConfirmation: EmailConfirmationInfo,
      public passwordRecovery?: PasswordRecoveryInfo,
   ) {}

   static createUser(
      input: UserInput,
      passwordHash: string,
      emailConfirmation: EmailConfirmationInfo,
   ): UserDocument {
      const user = new UserModel()

      user.login = input.login
      user.email = input.email
      user.passwordHash = passwordHash
      user.createdAt = new Date()
      user.emailConfirmation = emailConfirmation

      return user
   }

   confirmEmail(): void {
      this.emailConfirmation.isConfirmed = true
   }

   updateEmailConfirmation(emailConfirmation: EmailConfirmationInfo): void {
      this.emailConfirmation = emailConfirmation
   }

   setPasswordRecovery(passwordRecovery: PasswordRecoveryInfo): void {
      this.passwordRecovery = passwordRecovery
   }

   updatePassword(passwordHash: string): void {
      this.passwordHash = passwordHash
      this.passwordRecovery = undefined
   }
}

userSchema.loadClass(UserEntity)

export const UserModel = model<UserDb, UserModelType>('User', userSchema)
