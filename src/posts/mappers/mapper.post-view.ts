import { WithId } from 'mongodb'
import { PostDb, PostView } from '../posts.types'

export function mapperPostView(post: WithId<PostDb>): PostView {
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
