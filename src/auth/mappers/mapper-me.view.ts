import { MeViewModel } from '../auth.types'
import { UserDocument } from '../../users/users.model'

export const mapperMeView = (user: UserDocument): MeViewModel => {
   return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
   }
}
