import { userCollection } from '../db/mongo.db'
import { Filter, WithId } from 'mongodb'
import { GetUsersQueryParams } from './types/users.query.types'
import { UserDb, UsersQueryOutput } from './types/users.types'
import { mapUserView } from './mappers/map-user.view'

export const usersQueryRepository = {
   async getAll(query: GetUsersQueryParams): Promise<UsersQueryOutput> {
      const searchLoginTerm = query.searchLoginTerm ?? null
      const searchEmailTerm = query.searchEmailTerm ?? null

      const sortBy = query.sortBy ?? 'createdAt'
      const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc'

      const pageNumber = query.pageNumber ? Number(query.pageNumber) : 1
      const pageSize = query.pageSize ? Number(query.pageSize) : 10

      const skip = (pageNumber - 1) * pageSize

      const filter: Filter<WithId<UserDb>> = {}

      const searchConditions: Filter<WithId<UserDb>>[] = []

      if (searchLoginTerm) {
         searchConditions.push({
            login: {
               $regex: searchLoginTerm,
               $options: 'i',
            },
         })
      }

      if (searchEmailTerm) {
         searchConditions.push({
            email: {
               $regex: searchEmailTerm,
               $options: 'i',
            },
         })
      }

      if (searchConditions.length > 0) {
         filter.$or = searchConditions
      }

      const totalCount = await userCollection.countDocuments(filter)

      const users = await userCollection
         .find(filter)
         .sort({ [sortBy]: sortDirection })
         .skip(skip)
         .limit(pageSize)
         .toArray()

      return {
         pagesCount: Math.ceil(totalCount / pageSize),
         page: pageNumber,
         pageSize,
         totalCount,
         items: users.map(mapUserView),
      }
   },
}
