import { BlogView } from '../blogs.types'
import { BlogDocument } from '../blogs.model'

export function mapperBlogView(blog: BlogDocument): BlogView {
   return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
   }
}
