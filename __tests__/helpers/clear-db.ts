import request from 'supertest';
import { Express } from 'express';
import {HTTP_STATUSES, SETTINGS} from "../../src/core/settings";

export async function clearDb(app: Express) {
    await request(app)
        .delete(SETTINGS.PATH.DELETE_ALL)
        .expect(HTTP_STATUSES.NO_CONTENT_204);
    return;
}