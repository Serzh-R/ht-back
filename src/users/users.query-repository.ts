import { UsersQuery, UsersQueryOutput } from '../core/types/query.types'
import { mapperUserView } from './mappers/mapper-user.view'
import { UserModel } from './users.model'
import { UserDb } from './users.types'
import { injectable } from 'inversify'
import { QueryFilter } from 'mongoose'

@injectable()
export class UsersQueryRepository {
   async findAll(query: UsersQuery): Promise<UsersQueryOutput> {
      const filter: QueryFilter<UserDb> = {}

      const searchConditions: QueryFilter<UserDb>[] = []

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

      const totalCount = await UserModel.countDocuments(filter)

      const users = await UserModel.find(filter)
         .sort({
            [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1,
         })
         .skip(skip)
         .limit(query.pageSize)

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: users.map(mapperUserView),
      }
   }
}
