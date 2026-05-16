import { Paginator } from '../core/types/paginator.types'

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
   _id?: string
   login: string
   email: string
   passwordHash: string
   createdAt: Date
}

export type UsersQueryOutput = Paginator<UserView>
