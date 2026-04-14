import { Router, Request, Response } from 'express';

import { db } from '../db/db';
import { HTTP_STATUSES } from '../settings';

import type { BlogInput, BlogView } from './blogs.types';
import type { APIErrorResult } from '../types/errors.types';

export const blogsRouter = Router({});

export const blogsController = {

    getBlogs (req: Request, res: Response) {
        const blogs = db.blogs;
        res.status(HTTP_STATUSES.OK_200).json(blogs);
    },

    getBlogById (req: Request<{ id: string }>, res: Response<BlogView>) {
        const blog = db.blogs.find((b) => b.id === req.params.id);

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        res.status(HTTP_STATUSES.OK_200).json(blog);
    },

    createBlog (
        req: Request<{}, {}, BlogInput>,
        res: Response<BlogView | APIErrorResult>,
    ) {
        const { name, description, websiteUrl } = req.body;

        const errorsMessages: APIErrorResult['errorsMessages'] = [];

        if (!name || typeof name !== 'string' || name.trim().length > 15) {
            errorsMessages.push({
                message: 'Invalid name',
                field: 'name',
            });
        }

        if (
            !description ||
            typeof description !== 'string' ||
            description.trim().length > 500
        ) {
            errorsMessages.push({
                message: 'Invalid description',
                field: 'description',
            });
        }

        const websiteUrlPattern =
            /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

        if (
            !websiteUrl ||
            typeof websiteUrl !== 'string' ||
            websiteUrl.trim().length > 100 ||
            !websiteUrlPattern.test(websiteUrl)
        ) {
            errorsMessages.push({
                message: 'Invalid websiteUrl',
                field: 'websiteUrl',
            });
        }

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages });
            return;
        }

        const newBlog: BlogView = {
            id: String(Date.now()),
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
        };

        db.blogs.push(newBlog);

        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
    },

    updateBlog (
        req: Request<{ id: string }, {}, BlogInput>,
        res: Response<APIErrorResult>,
    ) {
        const blog = db.blogs.find((b) => b.id === req.params.id);

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        const { name, description, websiteUrl } = req.body;

        const errorsMessages: APIErrorResult['errorsMessages'] = [];

        if (!name || typeof name !== 'string' || name.trim().length > 15) {
            errorsMessages.push({
                message: 'Invalid name',
                field: 'name',
            });
        }

        if (
            !description ||
            typeof description !== 'string' ||
            description.trim().length > 500
        ) {
            errorsMessages.push({
                message: 'Invalid description',
                field: 'description',
            });
        }

        const websiteUrlPattern =
            /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

        if (
            !websiteUrl ||
            typeof websiteUrl !== 'string' ||
            websiteUrl.trim().length > 100 ||
            !websiteUrlPattern.test(websiteUrl)
        ) {
            errorsMessages.push({
                message: 'Invalid websiteUrl',
                field: 'websiteUrl',
            });
        }

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages });
            return;
        }

        blog.name = name.trim();
        blog.description = description.trim();
        blog.websiteUrl = websiteUrl.trim();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },

    deleteBlogById (req: Request<{ id: string }>, res: Response) {
        const blogIndex = db.blogs.findIndex((b) => b.id === req.params.id);

        if (blogIndex === -1) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        db.blogs.splice(blogIndex, 1);

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

}

blogsRouter.get('/', blogsController.getBlogs)
blogsRouter.post('/', blogsController.createBlog)
blogsRouter.get('/:id', blogsController.getBlogById)
blogsRouter.put('/:id', blogsController.updateBlog)
blogsRouter.delete('/:id', blogsController.deleteBlogById)

// GET /ht_02/api/blogs
/*blogsRouter.get('/', (req: Request, res: Response<BlogView[]>) => {
    res.status(HTTP_STATUSES.OK_200).json(db.blogs);
});*/

// GET /ht_02/api/blogs/:id
/*blogsRouter.get('/:id', (req: Request<{ id: string }>, res: Response<BlogView>) => {
    const blog = db.blogs.find((b) => b.id === req.params.id);

    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    res.status(HTTP_STATUSES.OK_200).json(blog);
});*/

// POST /ht_02/api/blogs
/*blogsRouter.post(
    '/',
    (
        req: Request<{}, {}, BlogInput>,
        res: Response<BlogView | APIErrorResult>,
    ) => {
        const { name, description, websiteUrl } = req.body;

        const errorsMessages: APIErrorResult['errorsMessages'] = [];

        if (!name || typeof name !== 'string' || name.trim().length > 15) {
            errorsMessages.push({
                message: 'Invalid name',
                field: 'name',
            });
        }

        if (
            !description ||
            typeof description !== 'string' ||
            description.trim().length > 500
        ) {
            errorsMessages.push({
                message: 'Invalid description',
                field: 'description',
            });
        }

        const websiteUrlPattern =
            /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

        if (
            !websiteUrl ||
            typeof websiteUrl !== 'string' ||
            websiteUrl.trim().length > 100 ||
            !websiteUrlPattern.test(websiteUrl)
        ) {
            errorsMessages.push({
                message: 'Invalid websiteUrl',
                field: 'websiteUrl',
            });
        }

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages });
            return;
        }

        const newBlog: BlogView = {
            id: String(Date.now()),
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
        };

        db.blogs.push(newBlog);

        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
    },
);*/

// PUT /ht_02/api/blogs/:id
/*blogsRouter.put(
    '/:id',
    (
        req: Request<{ id: string }, {}, BlogInput>,
        res: Response<APIErrorResult>,
    ) => {
        const blog = db.blogs.find((b) => b.id === req.params.id);

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        const { name, description, websiteUrl } = req.body;

        const errorsMessages: APIErrorResult['errorsMessages'] = [];

        if (!name || typeof name !== 'string' || name.trim().length > 15) {
            errorsMessages.push({
                message: 'Invalid name',
                field: 'name',
            });
        }

        if (
            !description ||
            typeof description !== 'string' ||
            description.trim().length > 500
        ) {
            errorsMessages.push({
                message: 'Invalid description',
                field: 'description',
            });
        }

        const websiteUrlPattern =
            /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

        if (
            !websiteUrl ||
            typeof websiteUrl !== 'string' ||
            websiteUrl.trim().length > 100 ||
            !websiteUrlPattern.test(websiteUrl)
        ) {
            errorsMessages.push({
                message: 'Invalid websiteUrl',
                field: 'websiteUrl',
            });
        }

        if (errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages });
            return;
        }

        blog.name = name.trim();
        blog.description = description.trim();
        blog.websiteUrl = websiteUrl.trim();

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
);*/

// DELETE /ht_02/api/blogs/:id
/*
blogsRouter.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    const blogIndex = db.blogs.findIndex((b) => b.id === req.params.id);

    if (blogIndex === -1) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    db.blogs.splice(blogIndex, 1);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});*/
