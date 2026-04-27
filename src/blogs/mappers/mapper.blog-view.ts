import { WithId } from 'mongodb'
import { BlogDb, BlogView } from '../blogs.types'

export function mapperBlogView(blog: WithId<BlogDb>): BlogView {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
  }
}
