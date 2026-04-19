import { db } from '../db/db'
import {BlogInput, BlogView} from './blogs.types'

export const blogsRepository = {
    findAll(): BlogView[] {
        return db.blogs
    },

    findById(id: string): BlogView | null {
        return db.blogs.find((b) => b.id === id) ?? null
    },

    create(newBlog: BlogView): BlogView {
        db.blogs.push(newBlog)
        return newBlog
    },

    update(id: string, dto: BlogInput): boolean {
        const blog = db.blogs.find((b) => b.id === id)

        if (!blog) {
            return false
        }

        blog.name = dto.name.trim()
        blog.description = dto.description.trim()
        blog.websiteUrl = dto.websiteUrl.trim()

        return true
    },

    delete(id: string): boolean {
        const blogIndex = db.blogs.findIndex((b) => b.id === id)

        if (blogIndex === -1) {
            return false
        }

        db.blogs.splice(blogIndex, 1)

        db.posts = db.posts.filter((p) => p.blogId !== id)

        return true
    },
}