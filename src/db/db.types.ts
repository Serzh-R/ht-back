import { PostView } from '../posts/posts.types'
import { BlogView } from '../blogs/blogs.types'
import { UserView } from '../users/users.types'

export type DBType = {
   blogs: BlogView[]
   posts: PostView[]
   users: UserView[]
}
