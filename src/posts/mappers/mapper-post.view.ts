import { PostView } from '../posts.types'
import { PostDocument } from '../posts.model'

export function mapperPostView(post: PostDocument): PostView {
   return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
   }
}
