import { Collection, Db, MongoClient } from 'mongodb'
import { SETTINGS } from '../core/settings'
import { BlogDb } from '../blogs/blogs.types'
import { PostDb } from '../posts/posts.types'
import { UserDb } from '../users/users.types'
import { CommentDb } from '../comments/comments.types'
import { BlacklistRefreshTokenDb, DeviceSessionDb } from '../auth/auth.types'

const BLOG_COLLECTION_NAME = 'blogs'
const POST_COLLECTION_NAME = 'posts'
const USER_COLLECTION_NAME = 'users'
const COMMENT_COLLECTION_NAME = 'comments'
const DEVICE_SESSION_COLLECTION_NAME = 'device-sessions'
const BLACKLIST_REFRESH_TOKEN_COLLECTION_NAME = 'blacklist-refresh-tokens'

export let client: MongoClient
export let blogCollection: Collection<BlogDb>
export let postCollection: Collection<PostDb>
export let userCollection: Collection<UserDb>
export let commentCollection: Collection<CommentDb>
export let deviceSessionCollection: Collection<DeviceSessionDb>
export let blacklistRefreshTokenCollection: Collection<BlacklistRefreshTokenDb>

export async function runDb(url: string): Promise<boolean> {
   client = new MongoClient(url)
   const db: Db = client.db(SETTINGS.DB_NAME)

   blogCollection = db.collection<BlogDb>(BLOG_COLLECTION_NAME)
   postCollection = db.collection<PostDb>(POST_COLLECTION_NAME)
   userCollection = db.collection<UserDb>(USER_COLLECTION_NAME)
   commentCollection = db.collection<CommentDb>(COMMENT_COLLECTION_NAME)
   deviceSessionCollection = db.collection<DeviceSessionDb>(DEVICE_SESSION_COLLECTION_NAME)
   blacklistRefreshTokenCollection = db.collection<BlacklistRefreshTokenDb>(
      BLACKLIST_REFRESH_TOKEN_COLLECTION_NAME,
   )

   await blacklistRefreshTokenCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 20 })

   try {
      await client.connect()
      await db.command({ ping: 1 })
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
