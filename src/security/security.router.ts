import { Router } from 'express'
import { jwtRefreshAuthMiddleware } from '../auth/middlewares/jwt-refresh-auth.middleware'
import { SecurityController } from './security.controller'
import { container } from '../composition-root'

const securityController = container.get(SecurityController)

export const securityRouter = Router({})

securityRouter.get(
   '/devices',
   jwtRefreshAuthMiddleware,
   securityController.getDevices.bind(securityController),
)

securityRouter.delete(
   '/devices',
   jwtRefreshAuthMiddleware,
   securityController.deleteOtherDevices.bind(securityController),
)

securityRouter.delete(
   '/devices/:deviceId',
   jwtRefreshAuthMiddleware,
   securityController.deleteDeviceById.bind(securityController),
)
