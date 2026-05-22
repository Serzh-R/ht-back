import { UserDb } from '../../users/users.types'
import { MeViewModel } from '../auth.types'
import { WithId } from 'mongodb'

export const mapperMeView = (user: WithId<UserDb>): MeViewModel => {
   return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
   }
}
