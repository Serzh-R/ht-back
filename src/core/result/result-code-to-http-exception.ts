import { HTTP_STATUSES } from '../settings'
import { ResultStatus } from './result.types'

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
   switch (resultCode) {
      case ResultStatus.Success:
         return HTTP_STATUSES.OK_200

      case ResultStatus.Created:
         return HTTP_STATUSES.CREATED_201

      case ResultStatus.NoContent:
         return HTTP_STATUSES.NO_CONTENT_204

      case ResultStatus.BadRequest:
         return HTTP_STATUSES.BAD_REQUEST_400

      case ResultStatus.Unauthorized:
         return HTTP_STATUSES.UNAUTHORIZED_401

      case ResultStatus.Forbidden:
         return HTTP_STATUSES.FORBIDDEN_403

      case ResultStatus.NotFound:
         return HTTP_STATUSES.NOT_FOUND_404

      default:
         return HTTP_STATUSES.SERVER_ERROR_500
   }
}
