import {body, param} from "express-validator";

export const idParamValidator = param('id')
    .isString()
    .withMessage('name should be a string')
    .trim()
    .notEmpty()
    .withMessage('name is required')

export const blogIdValidator = body('blogId')
    .isString()
    .withMessage('blogId should be a string')
    .trim()
    .notEmpty()

/***********************************************************************/

const BlogFields: string[] = ['name', 'description', 'websiteUrl']

export const specificFieldsValidator = (fields: string[]) => {
    return body().custom((_, { req }) => {
        const bodyKeys = Object.keys(req.body)

        const invalidFields = bodyKeys.filter((key) => !fields.includes(key))
        if (invalidFields.length > 0) {
        }
        return true
    })
}

export const blogFieldsValidator = [
    specificFieldsValidator(BlogFields),
    body('name')
        // .optional()
        .isString()
        .withMessage('name should be a string')
        .trim()
        .notEmpty()
        .withMessage('name is required')
        .isLength({ max: 15 })
        .withMessage('the name length should not exceed 15 characters'),
    body('description')
        //.optional()
        .isString()
        .withMessage('description should be a string')
        .trim()
        .notEmpty()
        .withMessage('description is required')
        .isLength({ max: 500 })
        .withMessage('the description length should not exceed 500 characters'),
    body('websiteUrl')
        //.optional()
        .isURL()
        .withMessage('websiteUrl should be a valid URL')
        .isString()
        .withMessage('websiteUrl should be a string')
        .trim()
        .notEmpty()
        .withMessage('websiteUrl is required')
        .isLength({ max: 100 })
        .withMessage('websiteUrl should not exceed 100 symbols')
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}\/?([a-zA-Z0-9._-]+\/?)*$/)
        .withMessage('websiteUrl must be a valid URL starting with https://'),
]