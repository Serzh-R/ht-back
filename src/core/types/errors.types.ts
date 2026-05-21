export type FieldError = {
   message: string
   field: string | null
}

export type APIErrorResult = {
   errorsMessages: FieldError[]
}
