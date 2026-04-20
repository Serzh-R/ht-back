import { SETTINGS } from '../../src/settings'

export function generateBasicAuthToken() {
    const credentials = `${SETTINGS.ADMIN.LOGIN}:${SETTINGS.ADMIN.PASSWORD}`
    const token = Buffer.from(credentials).toString('base64')

    return `Basic ${token}`
}