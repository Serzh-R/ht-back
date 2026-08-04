import { ObjectId } from 'mongodb'

export type ApiRequestDb = {
   _id?: ObjectId
   ip: string
   url: string
   date: Date
}
