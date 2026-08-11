import { UserView } from '../users.types'
import { UserDocument } from '../users.model'

export function mapperUserView(user: UserDocument): UserView {
   return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
   }
}
