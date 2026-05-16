import { Collection, Db, MongoClient } from 'mongodb'
import { SETTINGS } from '../core/settings'
import { BlogDb } from '../blogs/blogs.types'
import { PostDb } from '../posts/posts.types'
import { UserDb } from '../users/users.types'

const BLOG_COLLECTION_NAME = 'blogs'
const POST_COLLECTION_NAME = 'posts'
const USER_COLLECTION_NAME = 'users'

export let client: MongoClient
export let blogCollection: Collection<BlogDb>
export let postCollection: Collection<PostDb>
export let userCollection: Collection<UserDb>

export async function runDb(url: string): Promise<boolean> {
   client = new MongoClient(url)
   const db: Db = client.db(SETTINGS.DB_NAME)

   blogCollection = db.collection<BlogDb>(BLOG_COLLECTION_NAME)
   postCollection = db.collection<PostDb>(POST_COLLECTION_NAME)
   userCollection = db.collection<UserDb>(USER_COLLECTION_NAME)

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
