import { UserInput, UserView } from './users.types'
import { UsersRepository } from './users.repository'
import { Result, ResultStatus } from '../core/result/result.types'
import { BcryptService } from '../auth/adapters/bcrypt.service'
import { inject, injectable } from 'inversify'
import { UserModel } from './users.model'
import { mapperUserView } from './mappers/mapper-user.view'

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

      const user = UserModel.createUser(input, passwordHash, {
         confirmationCode: '',
         expirationDate: new Date(),
         isConfirmed: true,
      })

      await this.usersRepository.save(user)

      return {
         status: ResultStatus.Created,
         extensions: [],
         data: mapperUserView(user),
      }
   }

   async deleteUserById(id: string): Promise<Result> {
      const user = await this.usersRepository.findById(id)

      if (!user) {
         return {
            status: ResultStatus.NotFound,
            extensions: [],
            data: null,
         }
      }

      await this.usersRepository.delete(user)

      return {
         status: ResultStatus.NoContent,
         extensions: [],
         data: null,
      }
   }
}
