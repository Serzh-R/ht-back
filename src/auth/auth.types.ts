import { ObjectId } from 'mongodb'

export type LoginInputModel = {
   loginOrEmail: string
   password: string
}

export type LoginSuccessViewModel = {
   accessToken: string
}

export type MeViewModel = {
   email: string
   login: string
   userId: string
}

export type RegConfirmCode = {
   code: string
}

export type RegEmailResending = {
   email: string
}

export type BlacklistRefreshTokenDb = {
   _id?: ObjectId
   token: string
   createdAt: Date
}

export type DeviceSessionDb = {
   _id?: ObjectId
   userId: string
   deviceId: string
   ip: string
   title: string
   lastActiveDate: Date
   expirationDate: Date
}
