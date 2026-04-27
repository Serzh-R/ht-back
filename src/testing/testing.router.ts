import {Request, Response, Router} from "express";
import {HTTP_STATUSES, SETTINGS} from "../core/settings";
import {blogCollection, postCollection} from "../db/mongo.db";
import {db} from "../db/db";

export const testingRouter = Router({});

testingRouter.delete(SETTINGS.PATH.DELETE_ALL, async (req: Request, res: Response) => {
    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})

    db.blogs = []
    db.posts = []

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})