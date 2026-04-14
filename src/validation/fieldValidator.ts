import { BlogInput } from '../blogs/blogs.types'

export const blogFieldValidator = (data: BlogInput): Array<{ message: string; field: string }> => {
  const errorsArray: Array<{ message: string; field: string }> = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length > 15) {
    errorsArray.push({
      message: 'Invalid name',
      field: 'name',
    })
  }

  if (
    !data.description ||
    typeof data.description !== 'string' ||
    data.description.trim().length > 500
  ) {
    errorsArray.push({
      message: 'Invalid description',
      field: 'description',
    })
  }

  const websiteUrlPattern = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/

  if (
    !data.websiteUrl ||
    typeof data.websiteUrl !== 'string' ||
    data.websiteUrl.trim().length > 100 ||
    !websiteUrlPattern.test(data.websiteUrl)
  ) {
    errorsArray.push({
      message: 'Invalid websiteUrl',
      field: 'websiteUrl',
    })
  }

  return errorsArray
}
