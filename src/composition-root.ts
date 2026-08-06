import { BlogsRepository } from './blogs/blogs.repository'
import { BlogsQueryRepository } from './blogs/blogs.query-repository'
import { BlogsService } from './blogs/blogs.service'
import { BlogsController } from './blogs/blogs.controller'

const blogsRepository = new BlogsRepository()

const blogsQueryRepository = new BlogsQueryRepository()

const blogsService = new BlogsService(blogsRepository)

export const blogsController = new BlogsController(blogsService, blogsQueryRepository)
