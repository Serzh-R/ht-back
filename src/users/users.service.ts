import { UserDb, UserInput, UserView } from './users.types'
import { UsersRepository } from './users.repository'
import { Result, ResultStatus } from '../core/result/result.types'
import { BcryptService } from '../auth/adapters/bcrypt.service'
import { inject, injectable } from 'inversify'

@injectable()
export class UsersService {
   constructor(
      @inject(UsersRepository) private usersRepository: UsersRepository,
      @inject(BcryptService) private bcryptService: BcryptService,
   ) {}

   async createUser(input: UserInput): Promise<Result<UserView>> {
      const userByLogin = await this.usersRepository.findByLogin(input.login)

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

      const userByEmail = await this.usersRepository.findByEmail(input.email)

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

      const passwordHash = await this.bcryptService.generateHash(input.password)

      const newUser: UserDb = {
         login: input.login,
         email: input.email,
         passwordHash,
         createdAt: new Date(),
         emailConfirmation: {
            confirmationCode: '',
            expirationDate: new Date(),
            isConfirmed: true,
         },
      }

      const createdUser = await this.usersRepository.create(newUser)

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: createdUser,
      }
   }

   async deleteUserById(id: string): Promise<Result> {
      const isDeleted = await this.usersRepository.deleteById(id)

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
   }
}
