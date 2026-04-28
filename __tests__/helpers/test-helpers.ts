import { createApp } from '../../src/app'
import { agent } from 'supertest'

export const req = agent(createApp())
