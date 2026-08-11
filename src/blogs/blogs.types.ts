export type BlogInput = {
   name: string
   description: string
   websiteUrl: string
}

export type BlogDb = {
   name: string
   description: string
   websiteUrl: string
   createdAt: Date
   isMembership: boolean
}

export type BlogView = {
   id: string
   name: string
   description: string
   websiteUrl: string
   createdAt: string
   isMembership: boolean
}

export type BlogPostsParams = {
   blogId: string
}
