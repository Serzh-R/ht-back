import {APIErrorResult, FieldError} from '../../types/errors.types'

export const errorResponse = (errorsMessages: FieldError[]): APIErrorResult => {
  return { errorsMessages }
}


/*export const errorResponse = (errorsArray: Array<{ message: string; field: string }>) => {
  let errors_: APIErrorResult = {
    errorsMessages: [] as Array<{ message: string; field: string }>,
  }

  errorsArray.forEach((error) => {
    errors_.errorsMessages.push(error)
  })

  return errors_
}*/
