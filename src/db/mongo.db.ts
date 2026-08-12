import mongoose from 'mongoose'
import { Collection } from 'mongodb'
import { SETTINGS } from '../core/settings'
import { ApiRequestDb } from '../rate-limit/rate-limit.types'

const API_REQUEST_COLLECTION_NAME = 'api-requests'

export let apiRequestCollection: Collection<ApiRequestDb>

export async function runDb(url: string): Promise<boolean> {
   try {
      await mongoose.connect(url, {
         dbName: SETTINGS.DB_NAME,
      })

      const db = mongoose.connection.db

      if (!db) {
         throw new Error('Database connection is not initialized')
      }

      apiRequestCollection = db.collection<ApiRequestDb>(API_REQUEST_COLLECTION_NAME)

      await db.command({ ping: 1 })

      await apiRequestCollection.createIndex(
         {
            date: 1,
         },
         {
            expireAfterSeconds: 10,
         },
      )

      console.log('✅ Connected to the database')
      return true
   } catch (e) {
      await mongoose.disconnect()

      console.error('❌ Database not connected:', e)
      return false
   }
}

// для тестов
export async function stopDb() {
   if (mongoose.connection.readyState === 0) {
      throw new Error('❌ No active connection')
   }

   await mongoose.disconnect()
}

/*
import { Collection, Db, MongoClient } from 'mongodb'
import { SETTINGS } from '../core/settings'
import { BlogDb } from '../blogs/blogs.types'
import { PostDb } from '../posts/posts.types'
import { UserDb } from '../users/users.types'
import { CommentDb } from '../comments/comments.types'
import { DeviceSessionDb } from '../security/security.types'
import { ApiRequestDb } from '../rate-limit/rate-limit.types'

const BLOG_COLLECTION_NAME = 'blogs'
const POST_COLLECTION_NAME = 'posts'
const USER_COLLECTION_NAME = 'users'
const COMMENT_COLLECTION_NAME = 'comments'
const DEVICE_SESSION_COLLECTION_NAME = 'device-sessions'
const API_REQUEST_COLLECTION_NAME = 'api-requests'

export let client: MongoClient
export let blogCollection: Collection<BlogDb>
export let postCollection: Collection<PostDb>
export let userCollection: Collection<UserDb>
export let commentCollection: Collection<CommentDb>
export let deviceSessionCollection: Collection<DeviceSessionDb>
export let apiRequestCollection: Collection<ApiRequestDb>

export async function runDb(url: string): Promise<boolean> {
   client = new MongoClient(url)
   const db: Db = client.db(SETTINGS.DB_NAME)

   blogCollection = db.collection<BlogDb>(BLOG_COLLECTION_NAME)
   postCollection = db.collection<PostDb>(POST_COLLECTION_NAME)
   userCollection = db.collection<UserDb>(USER_COLLECTION_NAME)
   commentCollection = db.collection<CommentDb>(COMMENT_COLLECTION_NAME)
   deviceSessionCollection = db.collection<DeviceSessionDb>(DEVICE_SESSION_COLLECTION_NAME)
   apiRequestCollection = db.collection<ApiRequestDb>(API_REQUEST_COLLECTION_NAME)

   try {
      await client.connect()
      await db.command({ ping: 1 })

      await deviceSessionCollection.createIndex(
         {
            expirationDate: 1,
         },
         {
            expireAfterSeconds: 0,
         },
      )

      await apiRequestCollection.createIndex(
         {
            date: 1,
         },
         {
            expireAfterSeconds: 10,
         },
      )

      console.log('✅ Connected to the database')
      return true
   } catch (e) {
      await client.close()
      console.error('❌ Database not connected:', e)
      return false
   }
}

// для тестов
export async function stopDb() {
   if (!client) {
      throw new Error(`❌ No active client`)
   }
   await client.close()
}
*/
