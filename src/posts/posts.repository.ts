import { db } from '../db/db'
import { PostInput, PostView } from './posts.types'

export const postsRepository = {
  findAll(): PostView[] {
    return db.posts
  },

  findById(id: string): PostView | null {
    return db.posts.find((p) => p.id === id) ?? null
  },

  create(newPost: PostView): PostView {
    db.posts.push(newPost)
    return newPost
  },

  update(id: string, dto: PostInput, blogName: string): boolean {
    const post = db.posts.find((p) => p.id === id)

    if (!post) {
      return false
    }

    post.title = dto.title.trim()
    post.shortDescription = dto.shortDescription.trim()
    post.content = dto.content.trim()
    post.blogId = dto.blogId.trim()
    post.blogName = blogName

    return true
  },

  delete(id: string): boolean {
    const postIndex = db.posts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return false
    }

    db.posts.splice(postIndex, 1)
    return true
  },
}
