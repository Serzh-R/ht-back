import { Filter } from 'mongodb'
import { userCollection } from '../db/mongo.db'
import { UserDb } from './users.types'
import { UsersQuery, UsersQueryOutput } from '../core/types/query.types'
import { mapperUserView } from './mappers/mapper-user.view'

export const usersQueryRepository = {
   async findAll(query: UsersQuery): Promise<UsersQueryOutput> {
      const filter: Filter<UserDb> = {}

      const searchConditions: Filter<UserDb>[] = []

      if (query.searchLoginTerm) {
         searchConditions.push({
            login: {
               $regex: query.searchLoginTerm,
               $options: 'i',
            },
         })
      }

      if (query.searchEmailTerm) {
         searchConditions.push({
            email: {
               $regex: query.searchEmailTerm,
               $options: 'i',
            },
         })
      }

      if (searchConditions.length > 0) {
         filter.$or = searchConditions
      }

      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await userCollection.countDocuments(filter)

      const users = await userCollection
         .find(filter)
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)
         .toArray()

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: users.map(mapperUserView),
      }
   },
}
