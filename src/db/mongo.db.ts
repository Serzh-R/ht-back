import { Collection, Db, MongoClient } from 'mongodb'
import { SETTINGS } from '../core/settings'
import { BlogView } from '../blogs/blogs.types'
import { PostView } from '../posts/posts.types'

const BLOG_COLLECTION_NAME = 'blogs'
const POST_COLLECTION_NAME = 'posts'

export let client: MongoClient
export let blogCollection: Collection<BlogView>
export let postCollection: Collection<PostView>

export async function runDb(url: string): Promise<boolean> {
    client = new MongoClient(url)
    const db: Db = client.db(SETTINGS.DB_NAME)

    blogCollection = db.collection<BlogView>(BLOG_COLLECTION_NAME)
    postCollection = db.collection<PostView>(POST_COLLECTION_NAME)

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
        throw new Error(`❌ No active client`);
    }
    await client.close();
}