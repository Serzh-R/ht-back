import { PostsQuery } from '../core/types/query.types'
import { Paginator } from '../core/types/paginator.types'
import { PostView } from './posts.types'
import { postCollection } from '../db/mongo.db'
import { mapperPostView } from './mappers/mapper.post-view'
import { ObjectId } from 'mongodb'

export const postsQueryRepository = {
   async findAll(query: PostsQuery): Promise<Paginator<PostView>> {
      const skip = (query.pageNumber - 1) * query.pageSize

      const totalCount = await postCollection.countDocuments({})

      const posts = await postCollection
         .find({})
         .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
         .skip(skip)
         .limit(query.pageSize)
         .toArray()

      return {
         pagesCount: Math.ceil(totalCount / query.pageSize),
         page: query.pageNumber,
         pageSize: query.pageSize,
         totalCount,
         items: posts.map(mapperPostView),
      }
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
}
