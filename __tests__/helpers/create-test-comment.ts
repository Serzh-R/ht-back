import request from 'supertest'
import { Express } from 'express'

import { HTTP_STATUSES, SETTINGS } from '../../src/core/settings'
import { CommentView } from '../../src/comments/comments.types'

export const correctCommentData = {
   content: 'This is correct comment content',
}

export async function createTestComment(
   app: Express,
   postId: string,
   bearerToken: string,
   commentData = correctCommentData,
): Promise<CommentView> {
   const response = await request(app)
      .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
      .set('Authorization', bearerToken)
      .send(commentData)
      .expect(HTTP_STATUSES.CREATED_201)

   return response.body
}
