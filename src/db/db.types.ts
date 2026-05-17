import { PostView } from '../posts/posts.types'
import { BlogView } from '../blogs/blogs.types'
import { UserView } from '../users/types/users.types'

export type DBType = {
   blogs: BlogView[]
   posts: PostView[]
   users: UserView[]
}
