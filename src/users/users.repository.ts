import { injectable } from 'inversify'
import { UserDocument, UserModel } from './users.model'
import { Types } from 'mongoose'

@injectable()
export class UsersRepository {
   async findByLogin(login: string): Promise<UserDocument | null> {
      return UserModel.findOne({ login })
   }

   async findByEmail(email: string): Promise<UserDocument | null> {
      return UserModel.findOne({ email })
   }

   async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
      return UserModel.findOne({
         $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
   }

   async findById(id: string): Promise<UserDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
         return null
      }

      return UserModel.findById(id)
   }

   async findByConfirmationCode(code: string): Promise<UserDocument | null> {
      return UserModel.findOne({
         'emailConfirmation.confirmationCode': code,
      })
   }

   async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
      return UserModel.findOne({
         'passwordRecovery.recoveryCode': recoveryCode,
      })
   }

   async save(user: UserDocument): Promise<void> {
      await user.save()
   }

   async delete(user: UserDocument): Promise<void> {
      await user.deleteOne()
   }
}
