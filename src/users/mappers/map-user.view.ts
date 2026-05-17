import { UserDb, UserView } from '../types/users.types'
import { WithId } from 'mongodb'

export function mapUserView(user: WithId<UserDb>): UserView {
   return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
   }
}
