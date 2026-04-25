import { body, param } from 'express-validator'
import { blogsRepository } from '../../../blogs/blogs.repository'

export const idParamValidator = param('id')
  .isString()
  .withMessage('id should be a string')
  .trim()
  .notEmpty()
  .withMessage('id is required')

export const blogIdValidator = body('blogId')
  .isString()
  .withMessage('blogId should be a string')
  .trim()
  .notEmpty()

/***********************************************************************/

/*const BlogFields: string[] = ['name', 'description', 'websiteUrl']

export const specificFieldsValidator = (fields: string[]) => {
  return body().custom((_, { req }) => {
    const bodyKeys = Object.keys(req.body)

    const invalidFields = bodyKeys.filter((key) => !fields.includes(key))
    if (invalidFields.length > 0) {
    }
    return true
  })
}*/

export const blogFieldsValidator = [
  //specificFieldsValidator(BlogFields),
  body('name')
    .isString()
    .withMessage('name should be a string')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 1, max: 15 })
    .withMessage('name length should be from 1 to 15 symbols'),

  body('description')
    .isString()
    .withMessage('description should be a string')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('description length should be from 1 to 500 symbols'),

  body('websiteUrl')
    .isURL()
    .withMessage('websiteUrl should be a valid URL')
    .isString()
    .withMessage('websiteUrl should be a string')
    .trim()
    .notEmpty()
    .withMessage('websiteUrl is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('websiteUrl length should be from 1 to 100 symbols')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}\/?([a-zA-Z0-9._-]+\/?)*$/)
    .withMessage('websiteUrl must be a valid URL starting with https://'),
]

/******************************************************************/

export const postFieldsValidator = [
  body('title')
    .trim()
    .isString()
    .withMessage('title should be a string')
    .isLength({ min: 1, max: 30 })
    .withMessage('title length should be from 1 to 30'),

  body('shortDescription')
    .trim()
    .isString()
    .withMessage('shortDescription should be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('shortDescription length should be from 1 to 100'),

  body('content')
    .trim()
    .isString()
    .withMessage('content should be a string')
    .isLength({ min: 1, max: 1000 })
    .withMessage('content length should be from 1 to 1000'),

  body('blogId')
      .isString()
      .withMessage('blogId should be a string')
      .trim()
      .notEmpty()
      .withMessage('blogId is required')
      .custom(async (value) => {
          const blog = await blogsRepository.findById(value)

          if (!blog) {
              throw new Error('Invalid blogId')
          }
          return true
      })
]

export const postIdParamValidator = [param('id')
    .trim()
    .notEmpty()
    .withMessage('id is required')
]
