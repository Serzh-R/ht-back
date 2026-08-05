import { UsersRepository } from './users/users.repository'
import { UsersService } from './users/users.service'
import { UsersController } from './users/users.controller'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'

export const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService)
const authService = new AuthService(usersRepository)
export const authController = new AuthController(usersRepository, authService)
