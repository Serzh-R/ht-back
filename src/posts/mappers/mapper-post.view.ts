import { PostView } from '../posts.types'
import { PostDocument } from '../posts.model'
import { ExtendedLikesInfoView } from '../../likes/likes.types'

export function mapperPostView(
   post: PostDocument,
   extendedLikesInfo: ExtendedLikesInfoView,
): PostView {
   return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo,
   }
}
