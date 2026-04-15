import type { DBType } from './db.types'

export const db: DBType = {
  blogs: [
    {
      id: '1',
      name: 'Serzh',
      description: 'description',
      websiteUrl: 'https://live.com',
    },
    {
      id: '2',
      name: 'IT Blog',
      description: 'blog about backend',
      websiteUrl: 'https://itblog.com',
    },
    {
      id: '3',
      name: 'JS Notes',
      description: 'notes about javascript',
      websiteUrl: 'https://jsnotes.dev',
    },
  ],
  posts: [
    {
      id: '1',
      title: 'Back',
      shortDescription: 'shortDescription 1',
      content: 'content 1',
      blogId: '1',
      blogName: 'Serzh',
    },
    {
      id: '2',
      title: 'Node',
      shortDescription: 'shortDescription 2',
      content: 'content 2',
      blogId: '2',
      blogName: 'IT Blog',
    },
    {
      id: '3',
      title: 'TS',
      shortDescription: 'shortDescription 3',
      content: 'content 3',
      blogId: '3',
      blogName: 'JS Notes',
    },
  ],
}

export const setDB  = (dataset?: Partial<DBType>) => {
  if (!dataset) { // если в функцию ничего не передано - то очищаем базу данных
    db.blogs = []
    db.posts = []
    return
  }

  // если что-то передано - то заменяем старые значения новыми
  db.blogs = dataset.blogs ?? db.blogs
  db.posts = dataset.posts ?? db.posts
}
