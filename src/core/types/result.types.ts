import { FieldError } from './errors.types'

export enum ResultStatus {
   Success = 200,
   Created = 201,
   NoContent = 204,
   BadRequest = 400,
   Unauthorized = 401,
   Forbidden = 403,
   NotFound = 404,
   ConfirmCodeExpired = 410,
   TooManyRequests = 429,
   ServerError = 500,
}

export type Result<T = null> = {
   status: ResultStatus
   errorMessage?: string
   extensions: FieldError[]
   data: T | null
}
