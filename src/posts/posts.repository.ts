import { PostDb, PostInput, PostView } from './posts.types'
import { postCollection } from '../db/mongo.db'
import { mapperPostView } from './mappers/mapper.post-view'
import { ObjectId } from 'mongodb'

export const postsRepository = {
   async findAll(): Promise<PostView[]> {
      const posts = await postCollection.find({}).toArray()
      return posts.map(mapperPostView)
   },

   async findById(id: string): Promise<PostView | null> {
      if (!ObjectId.isValid(id)) {
         return null
      }

      const post = await postCollection.findOne({ _id: new ObjectId(id) })

      if (!post) {
         return null
      }

      return mapperPostView(post)
   },

   async create(input: PostInput, blogName: string): Promise<PostView> {
      const newPost: PostDb = {
         title: input.title,
         shortDescription: input.shortDescription,
         content: input.content,
         blogId: input.blogId,
         blogName,
         createdAt: new Date(),
      }

      const result = await postCollection.insertOne(newPost)

      const createdPost = await postCollection.findOne({
         _id: result.insertedId,
      })

      if (!createdPost) {
         throw new Error('Post was not created')
      }

      return mapperPostView(createdPost)
   },

   async update(id: string, input: PostInput, blogName: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await postCollection.updateOne(
         { _id: new ObjectId(id) },
         {
            $set: {
               title: input.title,
               shortDescription: input.shortDescription,
               content: input.content,
               blogId: input.blogId,
               blogName,
            },
         },
      )

      return result.matchedCount === 1
   },

   async updateBlogNameForPosts(blogId: string, blogName: string): Promise<void> {
      await postCollection.updateMany(
         { blogId },
         {
            $set: {
               blogName,
            },
         },
      )
   },

   async deletePostsByBlogId(blogId: string): Promise<void> {
      await postCollection.deleteMany({ blogId })
   },

   async delete(id: string): Promise<boolean> {
      if (!ObjectId.isValid(id)) {
         return false
      }

      const result = await postCollection.deleteOne({
         _id: new ObjectId(id),
      })

      return result.deletedCount === 1
   },
}
