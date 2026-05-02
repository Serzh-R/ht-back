import { BlogInput } from '../../blogs/blogs.types'
import { FieldError } from '../../core/types/errors.types'

export const blogFieldValidator = (data: BlogInput): FieldError[] => {
   const errorsArray: FieldError[] = []

   const name = typeof data.name === 'string' ? data.name.trim() : ''
   const description = typeof data.description === 'string' ? data.description.trim() : ''
   const websiteUrl = typeof data.websiteUrl === 'string' ? data.websiteUrl.trim() : ''

   if (name.length < 1 || name.length > 15) {
      errorsArray.push({
         message: 'Invalid name',
         field: 'name',
      })
   }

   if (description.length < 1 || description.length > 500) {
      errorsArray.push({
         message: 'Invalid description',
         field: 'description',
      })
   }

   const websiteUrlPattern = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/

   if (websiteUrl.length < 1 || websiteUrl.length > 100 || !websiteUrlPattern.test(websiteUrl)) {
      errorsArray.push({
         message: 'Invalid websiteUrl',
         field: 'websiteUrl',
      })
   }

   return errorsArray
}
