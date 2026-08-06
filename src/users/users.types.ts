import { ObjectId } from 'mongodb'

export type UserInput = {
   login: string
   password: string
   email: string
}

export type UserView = {
   id: string
   login: string
   email: string
   createdAt: string
}

export type EmailConfirmationInfo = {
   confirmationCode: string
   expirationDate: Date
   isConfirmed: boolean
}

export type PasswordRecoveryInfo = {
   recoveryCode: string
   expirationDate: Date
}

export type UserDb = {
   _id?: ObjectId

   login: string
   email: string
   passwordHash: string
   createdAt: Date

   emailConfirmation: EmailConfirmationInfo
   passwordRecovery?: PasswordRecoveryInfo
}
