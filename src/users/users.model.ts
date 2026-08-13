import { HydratedDocument, model, Schema } from 'mongoose'
import { EmailConfirmationInfo, PasswordRecoveryInfo, UserDb } from './users.types'

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

export type UserDocument = HydratedDocument<UserDb>

export const UserModel = model<UserDb>('User', userSchema)
