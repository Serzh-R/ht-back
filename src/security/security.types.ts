import { ObjectId } from 'mongodb'

export type DeviceSessionDb = {
   _id?: ObjectId
   userId: string
   deviceId: string
   ip: string
   title: string
   lastActiveDate: Date
   expirationDate: Date
}

export type DeviceViewModel = {
   ip: string
   title: string
   lastActiveDate: string
   deviceId: string
}
