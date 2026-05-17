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

export type UserDb = {
   _id?: ObjectId
   login: string
   email: string
   passwordHash: string
   createdAt: Date
}
