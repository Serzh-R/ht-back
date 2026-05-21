import { FieldError } from '../types/errors.types'

export enum ResultStatus {
   Success = 'Success',
   Created = 'Created',
   NoContent = 'NoContent',
   BadRequest = 'BadRequest',
   Unauthorized = 'Unauthorized',
   Forbidden = 'Forbidden',
   NotFound = 'NotFound',
   ServerError = 'ServerError',
}

export type ExtensionType = FieldError

export type Result<T = null> = {
   status: ResultStatus
   errorMessage?: string
   extensions: ExtensionType[]
   data: T | null
}
