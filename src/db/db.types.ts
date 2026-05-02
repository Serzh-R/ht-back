import { PostView } from '../posts/posts.types'
import { BlogView } from '../blogs/blogs.types'

export type DBType = {
   blogs: BlogView[]
   posts: PostView[]
}
