import { userCollection } from '../db/mongo.db'
import { ObjectId } from 'mongodb'
import { UserDb, UserView } from './users.types'
import { mapperUserView } from './mappers/mapper-user.view'

export const usersRepository = {
   async findByLogin(login: string): Promise<UserDb | null> {
      return userCollection.findOne({ login })
   },

   async findByEmail(email: string): Promise<UserDb | null> {
      return userCollection.findOne({ email })
   },

   async findByLoginOrEmail(loginOrEmail: string): Promise<UserDb | null> {
      return userCollection.findOne({
         $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
   },

   async findById(id: string) {
      if (!ObjectId.isValid(id)) {
         return null
      }

      return userCollection.findOne({ _id: new ObjectId(id) })
   },

   async findByConfirmationCode(code: string): Promise<UserDb | null> {
      return userCollection.findOne({
         'emailConfirmation.confirmationCode': code,
      })
   },

   async confirmEmail(userId: string): Promise<boolean> {
      const result = await userCollection.updateOne(
         { _id: new ObjectId(userId) },
         {
            $set: {
               'emailConfirmation.isConfirmed': true,
            },
         },
      )

      return result.matchedCount === 1
   },

   async updateConfirmationInfo(
      userId: string,
      confirmationCode: string,
      expirationDate: Date,
   ): Promise<boolean> {
      const result = await userCollection.updateOne(
         { _id: new ObjectId(userId) },
         {
            $set: {
               'emailConfirmation.confirmationCode': confirmationCode,
               'emailConfirmation.expirationDate': expirationDate,
            },
         },
      )

      return result.matchedCount === 1
   },

   async create(newUser: UserDb): Promise<UserView> {
      const result = await userCollection.insertOne(newUser)

      const createdUser = await userCollection.findOne({
         _id: result.insertedId,
      })

      if (!createdUser) {
         throw new Error('User was not created')
      }

      return mapperUserView(createdUser)
   },

   async deleteById(id: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await userCollection.deleteOne({
         _id: new ObjectId(id),
      })

      return result.deletedCount === 1
   },
}
