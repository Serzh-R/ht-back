import { Router } from 'express'
import { securityController } from './security.controller'
import { jwtRefreshAuthMiddleware } from '../auth/middlewares/jwt-refresh-auth.middleware'

export const securityRouter = Router({})

securityRouter.get('/devices', jwtRefreshAuthMiddleware, securityController.getDevices)

securityRouter.delete('/devices', jwtRefreshAuthMiddleware, securityController.deleteOtherDevices)

securityRouter.delete(
   '/devices/:deviceId',
   jwtRefreshAuthMiddleware,
   securityController.deleteDeviceById,
)
