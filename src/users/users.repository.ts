import { UserDb, UserView } from './users.types'
import { mapperUserView } from './mappers/mapper-user.view'
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

   async confirmEmail(userId: string): Promise<boolean> {
      const result = await UserModel.updateOne(
         { _id: userId },
         {
            $set: {
               'emailConfirmation.isConfirmed': true,
            },
         },
      )

      return result.matchedCount === 1
   }

   async updateConfirmationInfo(
      userId: string,
      confirmationCode: string,
      expirationDate: Date,
   ): Promise<boolean> {
      const result = await UserModel.updateOne(
         { _id: userId },
         {
            $set: {
               'emailConfirmation.confirmationCode': confirmationCode,
               'emailConfirmation.expirationDate': expirationDate,
            },
         },
      )

      return result.matchedCount === 1
   }

   async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
      return UserModel.findOne({
         'passwordRecovery.recoveryCode': recoveryCode,
      })
   }

   async updatePasswordRecoveryInfo(
      userId: string,
      recoveryCode: string,
      expirationDate: Date,
   ): Promise<boolean> {
      if (!Types.ObjectId.isValid(userId)) {
         return false
      }

      const result = await UserModel.updateOne(
         {
            _id: userId,
         },
         {
            $set: {
               passwordRecovery: {
                  recoveryCode,
                  expirationDate,
               },
            },
         },
      )

      return result.matchedCount === 1
   }

   async updatePasswordHash(userId: string, passwordHash: string): Promise<boolean> {
      if (!Types.ObjectId.isValid(userId)) {
         return false
      }

      const result = await UserModel.updateOne(
         {
            _id: userId,
         },
         {
            $set: {
               passwordHash,
            },
            $unset: {
               passwordRecovery: '',
            },
         },
      )

      return result.matchedCount === 1
   }

   async create(newUser: UserDb): Promise<UserView> {
      const createdUser = await UserModel.create(newUser)

      return mapperUserView(createdUser)
   }

   async deleteById(id: string): Promise<boolean> {
      if (!Types.ObjectId.isValid(id)) {
         return false
      }

      const result = await UserModel.deleteOne({
         _id: id,
      })

      return result.deletedCount === 1
   }
}
