import { Request, Response } from 'express'
import { HTTP_STATUSES } from '../core/settings'
import { usersQueryRepository } from './users.query-repository'
import { usersService } from './users.service'
import { ResultStatus } from '../core/types/result.types'
import { UserInput, UserView } from './users.types'
import { Paginator } from '../core/types/paginator.types'
import { UsersQueryInput } from '../core/types/query.types'
import { normalizeUsersQuery } from '../core/helpers/query-normalizers'

export const usersController = {
   async getUsers(
      req: Request<{}, Paginator<UserView>, {}, UsersQueryInput>,
      res: Response<Paginator<UserView>>,
   ) {
      const query = normalizeUsersQuery(req.query)

      const users = await usersQueryRepository.findAll(query)

      res.status(HTTP_STATUSES.OK_200).json(users)
   },

   async createUser(req: Request<{}, {}, UserInput>, res: Response) {
      const result = await usersService.createUser(req.body)

      if (result.status === ResultStatus.BadRequest) {
         res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages: result.extensions,
         })
         return
      }

      res.status(HTTP_STATUSES.CREATED_201).json(result.data!)
   },

   async deleteUser(req: Request<{ id: string }>, res: Response) {
      const result = await usersService.deleteUserById(req.params.id)

      if (result.status === ResultStatus.NotFound) {
         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
         return
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
   },
}
