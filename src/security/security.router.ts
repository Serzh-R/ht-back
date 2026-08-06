import { Router } from 'express'
import { jwtRefreshAuthMiddleware } from '../auth/middlewares/jwt-refresh-auth.middleware'
import { SecurityRepository } from './security.repository'
import { SecurityQueryRepository } from './security.query-repository'
import { SecurityService } from './security.service'
import { SecurityController } from './security.controller'

const securityRepository = new SecurityRepository()

const securityQueryRepository = new SecurityQueryRepository()

const securityService = new SecurityService(securityRepository)

const securityController = new SecurityController(securityService, securityQueryRepository)

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
