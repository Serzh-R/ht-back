import { UserDb, UserInput, UserView } from './users.types'
import { usersRepository } from './users.repository'
import { bcryptService } from '../auth/adapters/bcrypt.service'
import { Result, ResultStatus } from '../core/types/result.types'

export const usersService = {
   async createUser(input: UserInput): Promise<Result<UserView>> {
      const userByLogin = await usersRepository.findByLogin(input.login)

      if (userByLogin) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'login',
                  message: 'login should be unique',
               },
            ],
            data: null,
         }
      }

      const userByEmail = await usersRepository.findByEmail(input.email)

      if (userByEmail) {
         return {
            status: ResultStatus.BadRequest,
            extensions: [
               {
                  field: 'email',
                  message: 'email should be unique',
               },
            ],
            data: null,
         }
      }

      const passwordHash = await bcryptService.generateHash(input.password)

      const newUser: UserDb = {
         login: input.login,
         email: input.email,
         passwordHash,
         createdAt: new Date(),
      }

      const createdUser = await usersRepository.create(newUser)

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: createdUser,
      }
   },

   async deleteUserById(id: string): Promise<Result> {
      const isDeleted = await usersRepository.deleteById(id)

      if (!isDeleted) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   },
}
