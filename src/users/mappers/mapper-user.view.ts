import { UserDb, UserView } from '../users.types'
import { WithId } from 'mongodb'

export function mapperUserView(user: WithId<UserDb>): UserView {
   return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
   }
}
