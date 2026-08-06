import { BlogsRepository } from './blogs/blogs.repository'
import { BlogsQueryRepository } from './blogs/blogs.query-repository'
import { BlogsService } from './blogs/blogs.service'
import { BlogsController } from './blogs/blogs.controller'
import { PostsRepository } from './posts/posts.repository'
import { PostsQueryRepository } from './posts/posts.query-repository'

const blogsRepository = new BlogsRepository()
const blogsQueryRepository = new BlogsQueryRepository()
const postsRepository = new PostsRepository()
const postsQueryRepository = new PostsQueryRepository()

const blogsService = new BlogsService(blogsRepository, postsRepository)

export const blogsController = new BlogsController(
   blogsService,
   blogsQueryRepository,
   postsQueryRepository,
)
